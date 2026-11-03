#!/usr/bin/env node
/**
 * build-notes.mjs — converts hand-authored HTML study notes into structured JSON.
 *
 *   node scripts/build-notes.mjs
 *
 * Input : content/<subject>/*.html + content/<subject>/series.json
 *                                                        (override with --src=<dir>)
 * Output: src/content/subjects.json
 *         src/content/<subject>/index.json
 *         src/content/<subject>/notes/<slug>.json         (override with --out=<dir>)
 *
 * Every folder under content/ is a subject. Add a folder, add a series.json,
 * drop in HTML, re-run — nothing in this file needs editing to add a subject.
 *
 * Plain Node ESM. No npm dependencies — hand-rolled tokenizer + regex only.
 *
 * Two source layouts are supported:
 *   (A) collapsible: <div id="secN"><div class="section-header"><h1>..</h1></div>
 *                    <div class="section-content" id="cN">..</div></div>
 *       plus a <nav class="sidebar"> that supplies group labels + section order.
 *   (B) flat: no section-header/section-content and no sidebar (04_this_Keyword.html).
 *       Sections are delimited by top-level <h1> after the first <div class="title-block">,
 *       ids are synthesized sec1..secN, and every section lands in one "Contents" group.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

const argOf = (name, fallback) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? resolve(hit.slice(name.length + 3)) : fallback;
};

const CONTENT_DIR = argOf('src', join(REPO, 'content'));
const OUT_DIR = argOf('out', join(REPO, 'src', 'content'));

/* ============================================================================
 * 1. SANITIZATION RULES + BLOCKLIST GUARD
 * ----------------------------------------------------------------------------
 * Two tools for keeping something out of the published site.
 *
 * RULES rewrite source text on its way into the JSON. They're declarative, so a
 * newly added HTML file is cleaned by the same table. All three are empty today
 * because the source chapters are already clean; this is where to add one:
 *
 *   META_DROP_RULES  { id, test: /re/, why }                drop a title-block line
 *   PROSE_RULES      { id, where, find: /re/gi, replace }   rewrite a sentence
 *   CODE_RULES       { id, where, find: /re/g, replace }    rename sample data
 *
 * A prose rule must rewrite the sentence so it still reads naturally — never
 * delete a word and leave a broken clause. The build prints how often each fired.
 *
 * The BLOCKLIST GUARD (section 9) re-scans every generated file and FAILS THE
 * BUILD if any listed term appears. Terms live in content/.blocklist — one per
 * line, `#` for comments — which is gitignored, so the repository never has to
 * name what it keeps out. Without that file the guard is skipped, and the build
 * says so.
 * ==========================================================================*/

/** 1a. Title-block metadata lines that must be dropped wholesale. */
const META_DROP_RULES = [];

/** 1b. Prose rewrites, applied to every inline/prose string. Source text mixes
 *      hyphens and em dashes, so match dashes loosely: [-‐-―]. */
const PROSE_RULES = [];

/** 1c. Sample-data renames inside code blocks. Change an identifier AND its
 *      "// -> value" comments together so the code stays self-consistent. */
const CODE_RULES = [];

/** 1d. The guard's terms, read from the gitignored blocklist. */
const BLOCKLIST_FILE = join(CONTENT_DIR, '.blocklist');
const BLOCKED_TERMS = existsSync(BLOCKLIST_FILE)
  ? readFileSync(BLOCKLIST_FILE, 'utf8').split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean)
  : [];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FORBIDDEN = BLOCKED_TERMS.length ? new RegExp(BLOCKED_TERMS.map(escapeRe).join('|'), 'i') : null;

const RULE_HITS = Object.create(null);
const noteHit = (id) => { RULE_HITS[id] = (RULE_HITS[id] || 0) + 1; };

function applyProseRules(s) {
  let out = s;
  for (const r of PROSE_RULES) {
    if (r.find.test(out)) { noteHit(r.id); out = out.replace(r.find, r.replace); }
    r.find.lastIndex = 0;
  }
  return out;
}

function applyCodeRules(s) {
  let out = s;
  for (const r of CODE_RULES) {
    if (r.find.test(out)) { noteHit(r.id); out = out.replace(r.find, r.replace); }
    r.find.lastIndex = 0;
  }
  return out;
}

/* ============================================================================
 * 2. Tiny HTML tokenizer -> tree
 * ==========================================================================*/

const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'col', 'area', 'base']);
const RAW_TAGS = new Set(['pre', 'script', 'style', 'textarea']);
const DROP_TAGS = new Set(['script', 'style', 'nav', 'button', 'svg']);

function parseAttrs(raw) {
  const attrs = Object.create(null);
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) {
    const key = m[1].toLowerCase();
    if (!key) continue;
    attrs[key] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

function parseHTML(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const pushText = (text) => { if (text) top().children.push({ tag: '#text', text }); };

  const tagRe = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>/gi;
  let cursor = 0;
  let m;
  while ((m = tagRe.exec(html))) {
    pushText(html.slice(cursor, m.index));
    cursor = tagRe.lastIndex;

    if (m[0].startsWith('<!')) continue; // comment / doctype / cdata

    if (m[1]) { // closing tag
      const name = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === name) { stack.length = i; break; }
      }
      continue;
    }

    const name = m[2].toLowerCase();
    const attrs = parseAttrs(m[3] || '');
    const selfClosed = m[4] === '/';

    if (RAW_TAGS.has(name)) {
      const closeRe = new RegExp(`</${name}\\s*>`, 'i');
      const rest = html.slice(cursor);
      const close = rest.search(closeRe);
      const rawInner = close === -1 ? rest : rest.slice(0, close);
      cursor = close === -1 ? html.length : cursor + close + rest.slice(close).match(closeRe)[0].length;
      tagRe.lastIndex = cursor;
      if (!DROP_TAGS.has(name)) {
        top().children.push({ tag: name, attrs, children: [], raw: rawInner });
      }
      continue;
    }

    const node = { tag: name, attrs, children: [] };
    top().children.push(node);
    if (!selfClosed && !VOID_TAGS.has(name)) stack.push(node);
  }
  pushText(html.slice(cursor));
  return root;
}

/* ============================================================================
 * 3. Entities, escaping, small node helpers
 * ==========================================================================*/

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', middot: '·', bull: '•',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»',
  larr: '←', rarr: '→', uarr: '↑', darr: '↓', harr: '↔',
  times: '×', divide: '÷', deg: '°', copy: '©', reg: '®', trade: '™',
  plusmn: '±', ne: '≠', le: '≤', ge: '≥', infin: '∞', check: '✓',
  sup2: '²', sup3: '³', frac12: '½', eacute: 'é', egrave: 'è', uuml: 'ü',
  shy: '', zwnj: '', zwj: '',
};

function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (all, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      if (Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff) {
        try { return String.fromCodePoint(cp); } catch { return all; }
      }
      return all;
    }
    const key = body.toLowerCase();
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : all;
  });
}

/** Escape the three characters that must never appear raw in an "html" field. */
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Tighten a stray " ." typo, but NEVER when the period starts a method name:
   the author writes "fetch's .then" and "Solution — .call()", and welding
   those gives "fetch's.then" / "Solution —.call()", which reads as broken
   string handling rather than prose. */
const TIGHTEN_PUNCT = /\s+([.,;:!?])(?![A-Za-z0-9_$])/g;
const collapse = (s) => s.replace(/[ \t\r\n]+/g, ' ').replace(TIGHTEN_PUNCT, '$1').trim();

const classList = (node) => String(node.attrs?.class || '').split(/\s+/).filter(Boolean);
const hasClass = (node, c) => classList(node).includes(c);
const findClass = (node, c) => {
  if (node.tag !== '#text' && hasClass(node, c)) return node;
  for (const child of node.children || []) {
    const hit = findClass(child, c);
    if (hit) return hit;
  }
  return null;
};
const findTag = (node, tag) => {
  for (const child of node.children || []) {
    if (child.tag === tag) return child;
    const hit = findTag(child, tag);
    if (hit) return hit;
  }
  return null;
};

/** Plain visible text of a node (entities decoded, no markup). */
function textOf(node) {
  if (node.tag === '#text') return decodeEntities(node.text);
  if (node.tag === 'br') return ' ';
  if (node.raw !== undefined) return decodeEntities(node.raw);
  return (node.children || []).map(textOf).join('');
}

/* ============================================================================
 * 4. Inline HTML serialization (allowlist: <code> <strong> <em> <a href> <br>)
 * ==========================================================================*/

const INLINE_KEEP = new Set(['code', 'strong', 'em', 'a', 'br']);
const INLINE_ALIAS = { b: 'strong', i: 'em', strong: 'strong', em: 'em' };
/** Presentational leftovers that carry no content.
 *  NOTE: `demo-panel` is deliberately NOT here. The panels are hidden-by-default
 *  widgets, but their narration and <pre> blocks are real teaching content
 *  (03_Closures "5-Stage Morph" walkthrough). Only the widget chrome inside
 *  them — the stage counter and the live-console placeholder — is dropped. */
const DROP_CLASSES = new Set([
  'sidebar', 'sidebar-toggle', 'btn', 'back', 'demo-toggle',
  'toggle-icon', 'nav-link', 'answer-line',
  'step-counter', 'console-output', 'console-line',
]);

/** Tags that force a wrapper to be treated as structural rather than as prose. */
const BLOCK_TAGS = new Set([
  'p', 'div', 'ul', 'ol', 'li', 'table', 'pre', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'section', 'article', 'blockquote', 'figure', 'dl',
]);

/** A <div> with no block-level descendant is a styled paragraph (e.g.
 *  `<div class="narration">`): emitting it as one <p> keeps its inline markup
 *  instead of shredding it into loose text nodes. */
function hasBlockChild(node) {
  for (const c of node.children || []) {
    if (c.tag === '#text') continue;
    if (BLOCK_TAGS.has(c.tag)) return true;
    if (hasBlockChild(c)) return true;
  }
  return false;
}

function isDropped(node) {
  if (node.tag === '#text') return false;
  if (DROP_TAGS.has(node.tag)) return true;
  const cls = classList(node);
  return cls.some((c) => DROP_CLASSES.has(c));
}

function inlineOf(nodes) {
  const parts = [];
  const walk = (node) => {
    if (node.tag === '#text') { parts.push(escapeText(decodeEntities(node.text))); return; }
    if (isDropped(node)) return;
    if (node.tag === 'br') { parts.push('<br>'); return; }
    if (node.tag === 'hr') { parts.push('<br>'); return; }
    if (node.tag === 'pre') { parts.push(`<code>${escapeText(decodeEntities(node.raw || ''))}</code>`); return; }
    if (node.tag === 'ul' || node.tag === 'ol') {
      // Lists cannot survive inside an inline-only field: flatten to bulleted lines.
      const items = (node.children || []).filter((c) => c.tag === 'li');
      items.forEach((li) => { parts.push('<br>• '); (li.children || []).forEach(walk); });
      return;
    }
    if (node.tag === 'li') { parts.push('<br>• '); (node.children || []).forEach(walk); return; }
    if (node.tag === 'tr') { parts.push('<br>'); (node.children || []).forEach(walk); return; }
    if (node.tag === 'td' || node.tag === 'th') { (node.children || []).forEach(walk); parts.push(' '); return; }

    const alias = INLINE_ALIAS[node.tag] || node.tag;
    if (INLINE_KEEP.has(alias)) {
      if (alias === 'a') {
        const href = node.attrs?.href || '';
        const safe = /^(https?:|mailto:|#|\/)/i.test(href) ? href : '';
        if (!safe) { (node.children || []).forEach(walk); return; }
        parts.push(`<a href="${escapeText(decodeEntities(safe)).replace(/"/g, '&quot;')}">`);
        (node.children || []).forEach(walk);
        parts.push('</a>');
        return;
      }
      parts.push(`<${alias}>`);
      (node.children || []).forEach(walk);
      parts.push(`</${alias}>`);
      return;
    }
    // everything else (div, p, span, h*, table, ...) -> unwrap, keep the text
    (node.children || []).forEach(walk);
    if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'table'].includes(node.tag)) parts.push(' ');
  };

  (Array.isArray(nodes) ? nodes : [nodes]).forEach(walk);

  let html = parts.join('');
  html = html.replace(/[ \t\r\n]+/g, ' ');
  html = html.replace(/^(?:\s|<br>)+/, '').replace(/(?:\s|<br>)+$/, '');
  html = html.replace(TIGHTEN_PUNCT, '$1');
  html = html.replace(/(<br>)\s+/g, '$1');
  return applyProseRules(html.trim());
}

const plainOf = (nodes) => applyProseRules(collapse((Array.isArray(nodes) ? nodes : [nodes]).map(textOf).join(' ')));

/* ============================================================================
 * 5. Emoji badges / titles / slugs
 * ==========================================================================*/

const EMOJI_RUN = /^(?:[←-⯿☀-➿️‍\u{1F000}-\u{1FAFF}\u{1F900}-\u{1F9FF}]|\s)+/u;
const EMOJI_ANY = /[←-⯿☀-➿️‍\u{1F000}-\u{1FAFF}\u{1F900}-\u{1F9FF}]/gu;

const BADGE_BY_EMOJI = [
  { badge: 'star', test: /[⭐\u{1F31F}]/u },   // star / glowing star
  { badge: 'warn', test: /[⚠]/u },            // warning sign
  { badge: 'gear', test: /[⚙]/u },            // gear
];

/** "⭐ 3. Terminology Decoder" -> { badge:'star', n:'3', title:'Terminology Decoder' } */
function splitSectionTitle(raw) {
  let s = collapse(raw);
  let badge = null;
  let n = null;
  for (let guard = 0; guard < 6; guard++) {
    const emoji = s.match(EMOJI_RUN);
    if (emoji && emoji[0].trim()) {
      if (!badge) {
        const hit = BADGE_BY_EMOJI.find((b) => b.test.test(emoji[0]));
        if (hit) badge = hit.badge;
      }
      s = s.slice(emoji[0].length);
      continue;
    }
    const num = s.match(/^(\d+(?:\.\d+)?[a-z]?)\s*[.)—–-]\s+/i);
    if (num && n === null) { n = num[1]; s = s.slice(num[0].length); continue; }
    break;
  }
  s = tidySpacing(s.replace(EMOJI_ANY, ''));
  return { badge, n, title: applyProseRules(s) };
}

/** Collapse the gaps left behind by stripped emoji: "( Trickiest)" -> "(Trickiest)". */
const tidySpacing = (s) => s
  .replace(/\s{2,}/g, ' ')
  .replace(/\(\s+/g, '(')
  .replace(/\s+\)/g, ')')
  .replace(/\s+([,.;:!?])/g, '$1')
  .trim();

const stripEmoji = (s) => tidySpacing(collapse(String(s).replace(EMOJI_ANY, '')));

/**
 * Slug from the chapter title.
 *  - "&" becomes "and"
 *  - an interior stop-word "the" is dropped (kept when it starts the title)
 * "Execution Context & The Call Stack" -> execution-context-and-call-stack
 * "The Event Loop"                     -> the-event-loop
 */
function slugify(title) {
  const words = stripEmoji(decodeEntities(title))
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.filter((w, i) => !(i > 0 && w === 'the')).join('-');
}

/* ============================================================================
 * 6. Block builders
 * ==========================================================================*/

const BOX_KINDS = {
  'note-box': 'note',
  'blue-box': 'info',
  'tip-box': 'tip',
  'warn-box': 'warn',
  'danger-box': 'danger',
  'purple-box': 'key',
  'bonus-box': 'bonus',
};

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert', 'bonus'];

const codeBlock = (node, label = null) => ({
  t: 'code',
  code: applyCodeRules(decodeEntities(node.raw || '').replace(/^\n/, '').replace(/\s+$/, '')),
  label: label ? collapse(label) : null,
});

function tableBlock(node) {
  const rows = [];
  const collectRows = (n) => {
    for (const c of n.children || []) {
      if (c.tag === 'tr') rows.push(c);
      else if (['thead', 'tbody', 'tfoot'].includes(c.tag)) collectRows(c);
    }
  };
  collectRows(node);
  if (!rows.length) return null;
  const cellsOf = (tr) => (tr.children || []).filter((c) => c.tag === 'td' || c.tag === 'th');
  let head = [];
  let bodyRows = rows;
  const first = cellsOf(rows[0]);
  if (first.length && first.every((c) => c.tag === 'th')) {
    head = first.map((c) => inlineOf(c.children));
    bodyRows = rows.slice(1);
  }
  const body = bodyRows.map((tr) => cellsOf(tr).map((c) => inlineOf(c.children)));
  return { t: 'table', head, rows: body };
}

function listBlock(node) {
  const items = (node.children || [])
    .filter((c) => c.tag === 'li')
    .map((li) => inlineOf(li.children))
    .filter(Boolean);
  if (!items.length) return null;
  return { t: 'list', ordered: node.tag === 'ol', items };
}

/** A callout may contain <pre>; inline-only html can't hold code, so the code
 *  is emitted as its own block directly after the callout text. */
function emitCallout(node, kind, out) {
  let run = [];
  const flush = () => {
    const html = inlineOf(run);
    if (html) out.push({ t: 'callout', kind, html });
    run = [];
  };
  for (const child of node.children || []) {
    if (child.tag === 'pre') { flush(); out.push(codeBlock(child)); }
    else run.push(child);
  }
  flush();
}

const ANSWER_HEADING = /^Q\s*(\d+)\s*[-‐-―]?\s*answer\b/i;

function emitQuestion(node, out, ctx) {
  const heading = (node.children || []).find((c) => /^h[1-6]$/.test(c.tag));
  let difficulty = null;
  const tagSpan = findClass(node, 'tag');
  if (tagSpan) {
    const hit = classList(tagSpan).find((c) => c.startsWith('tag-') && DIFFICULTIES.includes(c.slice(4)));
    if (hit) difficulty = hit.slice(4);
  }
  if (!difficulty) {
    const text = textOf(node).toLowerCase();
    difficulty = DIFFICULTIES.find((d) => new RegExp(`\\b${d}\\b`).test(text)) || 'medium';
  }

  let n = null;
  const idMatch = /^q(\d+)$/i.exec(node.attrs?.id || '');
  if (idMatch) n = Number(idMatch[1]);
  if (n === null && heading) {
    const hm = /^\s*Q\s*(\d+)/i.exec(plainOf(heading.children));
    if (hm) n = Number(hm[1]);
  }
  if (n === null) n = ++ctx.qAuto;
  ctx.qAuto = Math.max(ctx.qAuto, n);

  const parts = [];
  if (heading) {
    const label = inlineOf((heading.children || []).filter((c) => !hasClass(c, 'tag')))
      .replace(/^Q\s*\d+\s*[-‐-―:]?\s*/i, '')
      .trim();
    if (label) parts.push(label);
  }
  const codes = [];
  for (const child of node.children || []) {
    if (child === heading) continue;
    if (child.tag === 'pre') { codes.push(codeBlock(child).code); continue; }
    if (isDropped(child)) {
      DROP_LOG.push({
        file: ctx.file,
        why: classList(child).find((c) => DROP_CLASSES.has(c)) || child.tag,
        words: collapse(textOf(child)).split(/\s+/).filter(Boolean).length,
      });
      continue;
    }
    const html = inlineOf([child]);
    if (html) parts.push(html);
  }

  // A question carries at most one `code` field. When the source question has
  // several <pre> (06_Prototypes Q10: the full example plus the 3-line recap the
  // follow-up asks about) the extras used to be concatenated into that single
  // field, which welded two unrelated snippets together. Emit them as their own
  // code blocks after the question instead — one JSON entry per source <pre>.
  out.push({
    t: 'question',
    n,
    difficulty,
    html: parts.join('<br>'),
    code: codes.length ? codes[0] : null,
  });
  for (const extra of codes.slice(1)) out.push({ t: 'code', code: extra, label: null });
}

/** Structural wrappers we silently unwrap; anything else is worth reporting. */
const KNOWN_WRAPPERS = new Set([
  'div', 'section', 'article', 'main', 'body', '#root', 'tbody', 'thead', 'tfoot',
  'figure', 'blockquote', 'center', 'font', 'small', 'label', 'dl', 'dt', 'dd',
]);

/** Convert a list of DOM children into the allowed block types. */
function emitBlocks(nodes, out, ctx) {
  for (const node of nodes || []) {
    if (node.tag === '#text') {
      const txt = collapse(decodeEntities(node.text));
      if (txt) out.push({ t: 'p', html: applyProseRules(escapeText(txt)) });
      continue;
    }
    if (isDropped(node)) {
      const words = collapse(textOf(node)).split(/\s+/).filter(Boolean).length;
      const why = classList(node).find((c) => DROP_CLASSES.has(c)) || node.tag;
      DROP_LOG.push({ file: ctx.file, why, words });
      continue;
    }

    switch (node.tag) {
      case 'pre': {
        out.push(codeBlock(node, ctx.pendingLabel));
        ctx.pendingLabel = null;
        continue;
      }
      case 'hr':
        out.push({ t: 'hr' });
        continue;
      case 'table': {
        const block = tableBlock(node);
        if (block) out.push(block);
        continue;
      }
      case 'ul':
      case 'ol': {
        const block = listBlock(node);
        if (block) out.push(block);
        continue;
      }
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4': {
        const plain = plainOf(node.children);
        const answerId = /^ans(\d+)$/i.exec(node.attrs?.id || '');
        const answerText = ANSWER_HEADING.exec(plain);
        if (answerId || answerText) {
          out.push({
            t: 'answer',
            n: Number(answerId ? answerId[1] : answerText[1]),
            html: inlineOf(node.children),
          });
          continue;
        }
        const level = node.tag === 'h3' || node.tag === 'h4' ? 3 : 2;
        const html = inlineOf(node.children);
        if (html) out.push({ t: 'h', level, html });
        continue;
      }
      case 'p':
      case 'span':
      case 'a': {
        const html = inlineOf([node]);
        if (html) out.push({ t: 'p', html });
        continue;
      }
      case 'div': {
        const cls = classList(node);
        if (cls.includes('question-block')) { emitQuestion(node, out, ctx); continue; }
        const boxCls = cls.find((c) => BOX_KINDS[c]);
        if (boxCls) { emitCallout(node, BOX_KINDS[boxCls], out); continue; }
        if (cls.includes('snippet')) {
          const labelNode = findClass(node, 'snippet-label');
          const label = labelNode ? plainOf(labelNode.children) : null;
          const rest = (node.children || []).filter((c) => c !== labelNode);
          const inner = [];
          emitBlocks(rest, inner, { ...ctx, pendingLabel: label });
          // attach the label to the first code block of the snippet
          let attached = false;
          for (const b of inner) {
            if (!attached && b.t === 'code' && !b.label) { b.label = label ? collapse(label) : null; attached = true; }
          }
          out.push(...inner);
          continue;
        }
        if (cls.includes('snippet-label')) continue;
        if (!hasBlockChild(node)) {
          const html = inlineOf([node]);
          if (html) out.push({ t: 'p', html });
          continue;
        }
        // page-break / title-block / plain wrappers: unwrap, keep content
        emitBlocks(node.children, out, ctx);
        continue;
      }
      default:
        if (!KNOWN_WRAPPERS.has(node.tag)) {
          const words = collapse(textOf(node)).split(/\s+/).filter(Boolean).length;
          if (words) unclassified.push(`${ctx.file}: <${node.tag}> had no block type — unwrapped into the surrounding text (${words} words)`);
        }
        emitBlocks(node.children, out, ctx);
    }
  }
}

/* ============================================================================
 * 7. Chapter parsing
 * ==========================================================================*/

/** Drop a single <em>/<strong> wrapper that spans the whole string. */
function unwrapWhole(html) {
  let out = html.trim();
  for (let i = 0; i < 2; i++) {
    const m = /^<(em|strong)>([\s\S]*)<\/\1>$/.exec(out);
    if (!m) break;
    const inner = m[2];
    if (new RegExp(`</${m[1]}>`).test(inner)) break; // not a single wrapper
    out = inner.trim();
  }
  return out;
}

function titleBlocks(root) {
  const found = [];
  const walk = (n) => {
    if (n.tag !== '#text' && hasClass(n, 'title-block')) found.push(n);
    (n.children || []).forEach(walk);
  };
  walk(root);
  return found;
}

/** Title-block metadata: title, kept lines, dropped lines, companion references. */
function readTitleBlock(tb) {
  const h1 = findTag(tb, 'h1');
  const title = h1 ? stripEmoji(plainOf(h1.children)) : '';
  const lines = [];
  const dropped = [];
  for (const p of (tb.children || []).filter((c) => c.tag === 'p')) {
    const text = plainOf(p.children);
    if (!text) continue;
    const rule = META_DROP_RULES.find((r) => r.test.test(text));
    if (rule) { noteHit(rule.id); dropped.push({ text, rule: rule.id }); continue; }
    lines.push({ text, em: !!findTag(p, 'em'), html: inlineOf(p.children) });
  }
  return { title, lines, dropped };
}

function parseNav(root) {
  const nav = (function find(n) {
    if (n.tag !== '#text' && hasClass(n, 'sidebar')) return n;
    for (const c of n.children || []) { const hit = find(c); if (hit) return hit; }
    return null;
  })(root);
  if (!nav) return null;
  const groups = [];
  let current = null;
  const walk = (n) => {
    if (n.tag === '#text') return;
    if (hasClass(n, 'group-label')) {
      current = { label: stripEmoji(plainOf(n.children)) || 'Contents', sectionIds: [] };
      groups.push(current);
      return;
    }
    if (n.tag === 'a') {
      const href = n.attrs?.href || '';
      if (href.startsWith('#')) {
        if (!current) { current = { label: 'Contents', sectionIds: [] }; groups.push(current); }
        current.sectionIds.push(href.slice(1));
      }
      return;
    }
    (n.children || []).forEach(walk);
  };
  walk(nav);
  return groups.filter((g) => g.sectionIds.length);
}

/** Layout A: <div id="secN"> with .section-header + .section-content */
function collectSectionsA(root) {
  const sections = [];
  const walk = (n) => {
    if (n.tag === '#text') return;
    const header = (n.children || []).find((c) => c.tag !== '#text' && hasClass(c, 'section-header'));
    const content = (n.children || []).find((c) => c.tag !== '#text' && hasClass(c, 'section-content'));
    if (header && content) {
      sections.push({ id: n.attrs?.id || content.attrs?.id || `sec${sections.length + 1}`, header, content });
      return;
    }
    (n.children || []).forEach(walk);
  };
  walk(root);
  return sections;
}

/**
 * Layout B (04_this_Keyword.html): no section wrappers, no sidebar.
 * Boundaries are the top-level <h1>s after the first .title-block, plus the
 * <h1> of any LATER .title-block (the "Practice Sheet" / "Answer Key" parts),
 * so no content is orphaned at the end of the document.
 */
function collectSectionsB(body) {
  const flat = [];
  for (const node of body.children || []) {
    if (node.tag === '#text') { flat.push(node); continue; }
    if (hasClass(node, 'title-block')) { flat.push({ ...node, __titleBlock: true }); continue; }
    if (hasClass(node, 'page-break')) {
      const innerTitle = (node.children || []).find((c) => c.tag !== '#text' && hasClass(c, 'title-block'));
      if (innerTitle) { flat.push({ ...innerTitle, __titleBlock: true }); continue; }
    }
    flat.push(node);
  }

  const sections = [];
  let seenFirstTitleBlock = false;
  let current = null;
  for (const node of flat) {
    if (node.__titleBlock) {
      if (!seenFirstTitleBlock) { seenFirstTitleBlock = true; continue; } // chapter header
      const h1 = findTag(node, 'h1');
      current = { id: `sec${sections.length + 1}`, headerNodes: h1 ? h1.children : [], nodes: [] };
      sections.push(current);
      // keep the sub-lines of that part header (e.g. "10 Output-Based Questions")
      for (const p of (node.children || []).filter((c) => c.tag === 'p')) current.nodes.push(p);
      continue;
    }
    if (!seenFirstTitleBlock) continue;
    if (node.tag === 'h1') {
      current = { id: `sec${sections.length + 1}`, headerNodes: node.children, nodes: [] };
      sections.push(current);
      continue;
    }
    if (current) current.nodes.push(node);
  }
  return sections;
}

/**
 * Fill in section numbers. Authored numbers ("3", "11a", "10.5") always win —
 * the prose cross-references them. Unnumbered sections (only in layout B: the
 * intro, the practice sheet, the answer key) continue from the highest number
 * seen so far, so a leading intro becomes "0" and trailing parts keep counting.
 */
function assignNumbers(sections) {
  const used = new Set(sections.map((s) => s.nRaw).filter(Boolean));
  let maxSeen = -1;
  for (const s of sections) {
    if (s.nRaw) {
      const v = parseFloat(s.nRaw);
      if (Number.isFinite(v)) maxSeen = Math.max(maxSeen, v);
      s.n = s.nRaw;
      continue;
    }
    let cand = Math.floor(maxSeen + 1);
    while (used.has(String(cand))) cand++;
    s.n = String(cand);
    used.add(s.n);
    maxSeen = Math.max(maxSeen, cand);
  }
}

function countWords(sections) {
  let words = 0;
  const add = (s) => {
    const clean = decodeEntities(String(s).replace(/<[^>]*>/g, ' '));
    const hits = clean.match(/[A-Za-z0-9_$][A-Za-z0-9_$'".-]*/g);
    words += hits ? hits.length : 0;
  };
  for (const sec of sections) {
    add(sec.title);
    for (const b of sec.blocks) {
      if (b.t === 'p' || b.t === 'h' || b.t === 'callout' || b.t === 'answer') add(b.html);
      else if (b.t === 'code') { add(b.code); if (b.label) add(b.label); }
      else if (b.t === 'list') b.items.forEach(add);
      else if (b.t === 'table') { b.head.forEach(add); b.rows.forEach((r) => r.forEach(add)); }
      else if (b.t === 'question') { add(b.html); if (b.code) add(b.code); }
    }
  }
  return words;
}

/* ============================================================================
 * 8. Topical tags — one shared vocabulary so the site filter stays consistent
 *    across chapters (the same concept always yields the same tag string).
 * ==========================================================================*/

/**
 * A subject supplies its own vocabulary in content/<subject>/series.json:
 *
 *   "vocabulary": [
 *     { "tag": "closures", "match": ["closure", "closures"] },
 *     { "tag": "interview", "match": ["interview"], "weight": 0.5 }
 *   ]
 *
 * `match` entries are plain words or phrases — no regex to write. They are
 * compiled to whole-word, case-insensitive patterns here. A subject with no
 * vocabulary falls back to inferring tags from its own section titles, so a
 * brand new subject still gets usable tags on the very first run.
 */
function compileVocabulary(vocabulary) {
  if (!Array.isArray(vocabulary) || !vocabulary.length) return null;
  return vocabulary
    .filter((v) => v && v.tag && Array.isArray(v.match) && v.match.length)
    .map(({ tag, match, weight = 1 }) => {
      const alternatives = match
        .slice()
        // longest first so "event loop" wins over "event" when both are listed
        .sort((a, b) => b.length - a.length)
        .map((term) => term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));
      return { tag, weight, re: new RegExp(`(?<![\\w-])(?:${alternatives.join('|')})(?![\\w-])`, 'gi') };
    });
}

const TAG_MIN = 3;
const TAG_MAX = 5;
const TAG_FLOOR = 8;      // absolute minimum score to be considered
const TAG_RELATIVE = 0.12; // ... and at least 12% of the chapter's top score

function chapterText(chapterTitle, sections) {
  return {
    titleText: `${chapterTitle} `,
    headText: `${sections.map((s) => s.title).join(' \n ')} `,
    bodyText: sections
      .map((s) => s.blocks.map((b) => {
        if (b.t === 'code') return b.code;
        if (b.t === 'list') return b.items.join(' ');
        if (b.t === 'table') return [...b.head, ...b.rows.flat()].join(' ');
        return b.html || '';
      }).join(' '))
      .join(' ')
      .replace(/<[^>]*>/g, ' '),
  };
}

/** Score each vocabulary tag: section titles weigh 6x, chapter title 10x. */
function deriveTags(chapterTitle, sections, vocab) {
  const { titleText, headText, bodyText } = chapterText(chapterTitle, sections);

  const count = (re, text) => { re.lastIndex = 0; const m = text.match(re); return m ? m.length : 0; };
  const scored = vocab.map(({ tag, re, weight = 1 }) => ({
    tag,
    score: Math.round((count(re, titleText) * 10 + count(re, headText) * 6 + count(re, bodyText)) * weight),
  })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag));

  const top = scored.length ? scored[0].score : 0;
  const cut = Math.max(TAG_FLOOR, top * TAG_RELATIVE);
  const strong = scored.filter((x) => x.score >= cut);
  const picked = (strong.length >= TAG_MIN ? strong : scored).slice(0, TAG_MAX).map((x) => x.tag);
  while (picked.length < TAG_MIN) {
    const next = scored.find((x) => !picked.includes(x.tag));
    if (!next) break;
    picked.push(next.tag);
  }
  return picked;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'why', 'how', 'into', 'your',
  'you', 'are', 'its', 'it', 'a', 'an', 'of', 'in', 'on', 'to', 'is', 'as', 'at', 'by', 'or', 'not',
  'vs', 'via', 'part', 'chapter', 'section', 'intro', 'introduction', 'basics', 'complete', 'guide',
  'sheet', 'key', 'notes', 'overview', 'summary', 'common', 'actually', 'really', 'inside', 'under',
  'using', 'about', 'more', 'less', 'each', 'every', 'them', 'they', 'their', 'one', 'two', 'three',
]);

/**
 * No vocabulary declared for this subject yet — infer tags from the words that
 * recur across its own section titles. Crude next to a curated vocabulary, but
 * it means a brand new subject is usable from the first run instead of
 * shipping untagged, and the terms it surfaces are a good starting point to
 * paste into series.json.
 */
function inferVocabulary(chapters) {
  const freq = new Map();

  for (const c of chapters) {
    const seen = new Set();
    const words = [c.title, ...c.sections.map((s) => s.title)]
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9+#\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w));

    for (const w of words) {
      const stem = w.replace(/(ies|es|s)$/, (m, g) => (g === 'ies' ? 'y' : ''));
      if (stem.length < 4 || STOPWORDS.has(stem)) continue;
      if (seen.has(stem)) continue; // once per chapter — measures spread, not repetition
      seen.add(stem);
      freq.set(stem, (freq.get(stem) || 0) + 1);
    }
  }

  // A term in only one chapter can't group anything, and one in every chapter
  // can't separate anything — but those rules only make sense once there are
  // several chapters. A new subject usually has one or two, and shipping it
  // with zero tags would look broken, so below that we take whatever recurs.
  const enough = chapters.length >= 4;
  const minChapters = enough ? 2 : 1;
  const maxChapters = enough ? chapters.length - 1 : chapters.length;

  return [...freq.entries()]
    .filter(([, n]) => n >= minChapters && n <= maxChapters)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18)
    .map(([term]) => ({ tag: term, match: [term] }));
}

/* ============================================================================
 * 9. Build
 * ==========================================================================*/

const warnings = [];
const unclassified = [];
/** Every presentational node thrown away, with its word count, for the report. */
const DROP_LOG = [];

function parseFile(dir, file, order) {
  const html = readFileSync(join(dir, file), 'utf8');
  const bodyStart = html.indexOf('<body');
  const root = parseHTML(bodyStart === -1 ? html : html.slice(html.indexOf('>', bodyStart) + 1));
  const body = root;

  const tbs = titleBlocks(root);
  if (!tbs.length) throw new Error(`${file}: no .title-block found`);
  const meta = readTitleBlock(tbs[0]);

  const navGroups = parseNav(root);
  const layout = navGroups && collectSectionsA(root).length ? 'A' : 'B';

  const ctx = { qAuto: 0, pendingLabel: null, file };
  let sections = [];

  if (layout === 'A') {
    for (const raw of collectSectionsA(root)) {
      const headerH = findTag(raw.header, 'h1') || findTag(raw.header, 'h2');
      const rawTitle = headerH
        ? plainOf((headerH.children || []).filter((c) => !(c.tag !== '#text' && (hasClass(c, 'tag') || hasClass(c, 'toggle-icon')))))
        : '';
      const { badge, n, title } = splitSectionTitle(rawTitle);
      const blocks = [];
      ctx.pendingLabel = null;
      emitBlocks(raw.content.children, blocks, ctx);
      sections.push({ id: raw.id, nRaw: n, title, badge, group: null, blocks });
    }
  } else {
    for (const raw of collectSectionsB(body)) {
      const rawTitle = plainOf((raw.headerNodes || []).filter((c) => !(c.tag !== '#text' && hasClass(c, 'tag'))));
      const { badge, n, title } = splitSectionTitle(rawTitle);
      const blocks = [];
      ctx.pendingLabel = null;
      emitBlocks(raw.nodes, blocks, ctx);
      sections.push({ id: raw.id, nRaw: n, title, badge, group: null, blocks });
    }
  }

  sections = sections.filter((s) => s.title || s.blocks.length);
  if (!sections.length) throw new Error(`${file}: produced zero sections`);
  assignNumbers(sections);

  // ---- groups + ordering -------------------------------------------------
  let groups;
  if (layout === 'A') {
    const byId = new Map(sections.map((s) => [s.id, s]));
    const ordered = [];
    groups = [];
    for (const g of navGroups) {
      const ids = g.sectionIds.filter((id) => byId.has(id));
      const missing = g.sectionIds.filter((id) => !byId.has(id));
      if (missing.length) warnings.push(`${file}: nav links to unknown section(s) ${missing.join(', ')}`);
      if (!ids.length) continue;
      groups.push({ label: g.label, sectionIds: ids });
      for (const id of ids) { byId.get(id).group = g.label; ordered.push(byId.get(id)); }
    }
    const leftovers = sections.filter((s) => !s.group);
    if (leftovers.length) {
      warnings.push(`${file}: ${leftovers.length} section(s) absent from the sidebar -> group "More" (${leftovers.map((s) => s.id).join(', ')})`);
      groups.push({ label: 'More', sectionIds: leftovers.map((s) => s.id) });
      leftovers.forEach((s) => { s.group = 'More'; ordered.push(s); });
    }
    sections = ordered;
  } else {
    groups = [{ label: 'Contents', sectionIds: sections.map((s) => s.id) }];
    sections.forEach((s) => { s.group = 'Contents'; });
  }

  // ---- chapter metadata --------------------------------------------------
  const title = meta.title;
  const emLine = meta.lines.find((l) => l.em && !/companion file/i.test(l.text));
  // the descriptive line is usually wrapped in <em> for styling — unwrap it,
  // a summary is not an emphasis.
  const summary = unwrapWhole((emLine || meta.lines[meta.lines.length - 1] || { html: '' }).html);
  const companionRefs = meta.lines
    .filter((l) => /companion file\s*:/i.test(l.text))
    .map((l) => stripEmoji(l.text.replace(/.*companion file\s*:/i, '').replace(/\(.*$/, '')).trim());

  const isRef = /^REF/i.test(file);
  const numMatch = /^(\d+)/.exec(file);
  const chapterLabel = isRef ? 'Reference' : `Chapter ${numMatch ? Number(numMatch[1]) : order}`;

  // Code lives in two places: standalone `t:"code"` blocks and the `code` field
  // of a question. Counting only the first understates every chapter that has a
  // practice sheet by exactly its question count, which masked real losses.
  const codeCount = sections.reduce(
    (a, s) => a + s.blocks.filter((b) => b.t === 'code' || (b.t === 'question' && b.code)).length,
    0,
  );
  const questionCount = sections.reduce((a, s) => a + s.blocks.filter((b) => b.t === 'question').length, 0);
  const words = countWords(sections);

  // Every source <pre> must survive as exactly one code string. Reported (and
  // warned about) so a silent drop can never hide behind the totals again.
  // Count <pre> in the real markup only. Authoring notes often *mention*
  // <pre> inside an HTML comment, which would otherwise inflate the expected
  // count and raise a false "lost a code block" warning.
  const srcCodeCount = (html.replace(/<!--[\s\S]*?-->/g, '').match(/<pre[\s>]/gi) || []).length;
  if (srcCodeCount !== codeCount) {
    warnings.push(`${file}: ${srcCodeCount} source <pre> but ${codeCount} code block(s) emitted (${codeCount - srcCodeCount})`);
  }

  return {
    file,
    order,
    slug: slugify(title),
    title,
    chapterLabel,
    summary,
    layout,
    companionRefs,
    droppedMeta: meta.dropped,
    groups,
    sections,
    codeCount,
    srcCodeCount,
    questionCount,
    words,
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  };
}

const titleCase = (s) =>
  s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

/** A folder without series.json still builds, on sensible defaults. */
function readSeries(dir, folder) {
  const path = join(dir, 'series.json');
  if (!existsSync(path)) {
    warnings.push(`${folder}: no series.json — using defaults (add one to set the title, blurb, order and tag vocabulary)`);
    return { title: titleCase(folder), short: titleCase(folder), blurb: '', order: 999 };
  }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return {
      title: parsed.title || titleCase(folder),
      short: parsed.short || parsed.title || titleCase(folder),
      blurb: parsed.blurb || '',
      order: Number.isFinite(parsed.order) ? parsed.order : 999,
      accent: parsed.accent || null,
      vocabulary: parsed.vocabulary,
    };
  } catch (err) {
    throw new Error(`${folder}/series.json is not valid JSON: ${err.message}`);
  }
}

function buildSubject(folder) {
  const dir = join(CONTENT_DIR, folder);
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.html')).sort();
  if (!files.length) {
    warnings.push(`${folder}: no .html files — skipped`);
    return null;
  }

  const series = readSeries(dir, folder);
  const chapters = files.map((f, i) => parseFile(dir, f, i + 1));

  // companions: resolve "Companion file: <title>" cross-references, within this subject
  const byTitle = new Map(chapters.map((c) => [c.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(), c.slug]));
  for (const c of chapters) {
    c.companions = [];
    for (const ref of c.companionRefs) {
      const key = ref.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      let slug = byTitle.get(key);
      if (!slug) {
        const hit = chapters.find((o) => o !== c && (o.title.toLowerCase().includes(key) || key.includes(o.title.toLowerCase())));
        slug = hit?.slug;
      }
      if (slug && slug !== c.slug && !c.companions.includes(slug)) c.companions.push(slug);
      else if (!slug) warnings.push(`${folder}/${c.file}: unresolved companion reference "${ref}"`);
    }
  }

  const declared = compileVocabulary(series.vocabulary);
  const vocab = declared || compileVocabulary(inferVocabulary(chapters));
  const inferred = !declared;
  if (inferred) {
    warnings.push(`${folder}: no vocabulary in series.json — tags inferred from section titles. Curate them by pasting a "vocabulary" block into content/${folder}/series.json.`);
  }
  for (const c of chapters) c.tags = vocab ? deriveTags(c.title, c.sections, vocab) : [];

  return { folder, series, chapters, files, inferred };
}

function main() {
  if (!existsSync(CONTENT_DIR)) throw new Error(`content folder not found: ${CONTENT_DIR}`);

  const folders = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
  if (!folders.length) throw new Error(`no subject folders in ${CONTENT_DIR}`);

  const subjects = folders.map(buildSubject).filter(Boolean);
  if (!subjects.length) throw new Error('no subject produced any chapters');
  subjects.sort((a, b) => a.series.order - b.series.order || a.folder.localeCompare(b.folder));

  // Wipe generated output so a removed chapter or subject can't linger as a
  // stale JSON file the site still links to.
  rmSync(OUT_DIR, { recursive: true, force: true });

  const written = [];

  for (const s of subjects) {
    const notesDir = join(OUT_DIR, s.folder, 'notes');
    mkdirSync(notesDir, { recursive: true });

    for (const c of s.chapters) {
      const note = {
        subject: s.folder,
        slug: c.slug,
        title: c.title,
        chapterLabel: c.chapterLabel,
        summary: c.summary,
        tags: c.tags,
        video: null,
        groups: c.groups,
        sections: c.sections.map((sec) => ({
          id: sec.id, n: String(sec.n), title: sec.title, badge: sec.badge, group: sec.group, blocks: sec.blocks,
        })),
      };
      const path = join(notesDir, `${c.slug}.json`);
      writeFileSync(path, `${JSON.stringify(note, null, 2)}\n`, 'utf8');
      written.push(path);
    }

    const index = {
      subject: s.folder,
      series: s.series.title,
      short: s.series.short,
      blurb: s.series.blurb,
      accent: s.series.accent,
      generatedFrom: s.files.length,
      chapters: s.chapters.map((c) => ({
        subject: s.folder,
        slug: c.slug,
        order: c.order,
        chapterLabel: c.chapterLabel,
        title: c.title,
        summary: c.summary,
        tags: c.tags,
        groups: c.groups.map((g) => g.label),
        sectionCount: c.sections.length,
        codeCount: c.codeCount,
        questionCount: c.questionCount,
        words: c.words,
        readingMinutes: c.readingMinutes,
        companions: c.companions,
      })),
    };
    const indexPath = join(OUT_DIR, s.folder, 'index.json');
    writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
    written.push(indexPath);
  }

  const subjectsPath = join(OUT_DIR, 'subjects.json');
  writeFileSync(subjectsPath, `${JSON.stringify({
    subjects: subjects.map((s) => ({
      subject: s.folder,
      series: s.series.title,
      short: s.series.short,
      blurb: s.series.blurb,
      accent: s.series.accent,
      order: s.series.order,
      chapters: s.chapters.length,
      sections: s.chapters.reduce((n, c) => n + c.sections.length, 0),
      questions: s.chapters.reduce((n, c) => n + c.questionCount, 0),
      minutes: s.chapters.reduce((n, c) => n + c.readingMinutes, 0),
      tagsInferred: s.inferred,
    })),
  }, null, 2)}\n`, 'utf8');
  written.push(subjectsPath);

  // ---- FINAL GUARD -------------------------------------------------------
  let failures = 0;
  for (const path of FORBIDDEN ? written : []) {
    const text = readFileSync(path, 'utf8');
    const re = new RegExp(FORBIDDEN.source, 'gi');
    let m;
    while ((m = re.exec(text))) {
      failures++;
      const from = Math.max(0, m.index - 160);
      const to = Math.min(text.length, m.index + 160);
      console.error(`\nGUARD FAILURE in ${path} at offset ${m.index}:`);
      console.error(`...${text.slice(from, to).replace(/\s+/g, ' ')}...`);
    }
  }

  // ---- report ------------------------------------------------------------
  console.log(`source : ${CONTENT_DIR}  (${subjects.length} subject${subjects.length === 1 ? '' : 's'})`);
  console.log(`output : ${OUT_DIR}`);

  const all = subjects.flatMap((s) => s.chapters);
  for (const s of subjects) {
    console.log(`\n${s.series.title}  (content/${s.folder})${s.inferred ? '   [tags inferred]' : ''}`);
    console.log('  chapter                                lay  secs  code/src  qs  words  min  tags');
    for (const c of s.chapters) {
      console.log(
        `  ${c.slug.padEnd(38)} ${c.layout}   ${String(c.sections.length).padStart(4)} ` +
        `${String(c.codeCount).padStart(5)}/${String(c.srcCodeCount).padEnd(3)}${c.codeCount === c.srcCodeCount ? ' ' : '!'}` +
        `${String(c.questionCount).padStart(4)} ` +
        `${String(c.words).padStart(6)} ${String(c.readingMinutes).padStart(4)}  ${c.tags.join(',')}`
      );
    }
  }

  const totals = all.reduce((a, c) => ({
    s: a.s + c.sections.length, c: a.c + c.codeCount, src: a.src + c.srcCodeCount,
    q: a.q + c.questionCount, w: a.w + c.words,
  }), { s: 0, c: 0, src: 0, q: 0, w: 0 });
  console.log(`\n${'TOTAL'.padEnd(40)}     ${String(totals.s).padStart(4)} ${String(totals.c).padStart(5)}/${String(totals.src).padEnd(4)}${String(totals.q).padStart(4)} ${String(totals.w).padStart(6)}`);

  const rules = [...META_DROP_RULES, ...PROSE_RULES, ...CODE_RULES];
  if (rules.length) {
    console.log('\nsanitization rule hits:');
    for (const r of rules) {
      console.log(`  ${(RULE_HITS[r.id] || 0) > 0 ? 'ok  ' : 'MISS'} ${r.id.padEnd(24)} ${RULE_HITS[r.id] || 0}`);
    }
  }

  if (warnings.length) {
    console.log('\nwarnings:');
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (unclassified.length) {
    console.log(`\nunclassified content: ${unclassified.length}`);
    unclassified.forEach((u) => console.log(`  - ${u}`));
  }

  if (failures) {
    console.error(`\nBUILD FAILED: ${failures} blocklisted term(s) found in the generated content.`);
    process.exit(1);
  }
  console.log(
    FORBIDDEN
      ? `\nguard: clean — none of the ${BLOCKED_TERMS.length} blocklisted term(s) appear in ${written.length} files.`
      : '\nguard: skipped — no content/.blocklist (see section 1 of this file).',
  );
}

main();
