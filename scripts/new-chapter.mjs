#!/usr/bin/env node
/**
 * new-chapter.mjs — scaffold a chapter (and a subject, if it's new).
 *
 *   npm run new
 *   npm run new -- --subject=system-design --title="Caching Strategies"
 *   npm run new -- --subject=dsa --title="Big-O" --series="Data Structures & Algorithms" --short=DSA
 *
 * Every prompt has a --flag, so it scripts as well as it prompts.
 *
 * Writes content/<subject>/NN_Title.html pre-filled with the markup the parser
 * understands: grouped sidebar nav, collapsible sections, callout boxes, code,
 * tables, and a tagged practice sheet with a matching answer key.
 *
 * It does NOT run the build — edit the file, then `npm run docs`.
 */
import { createInterface } from 'node:readline/promises'
import { once } from 'node:events'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stdin, stdout } from 'node:process'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(REPO, 'content')

const argOf = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : null
}

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())

/** A filename the parser can order by: 04_Caching_Strategies.html */
const fileNameFor = (n, title) =>
  `${String(n).padStart(2, '0')}_${title.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}.html`

function existingSubjects() {
  if (!existsSync(CONTENT)) return []
  return readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => {
      const dir = join(CONTENT, d.name)
      const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.html'))
      let title = titleCase(d.name)
      const seriesPath = join(dir, 'series.json')
      if (existsSync(seriesPath)) {
        try {
          title = JSON.parse(readFileSync(seriesPath, 'utf8')).title || title
        } catch {
          /* malformed series.json is the build's problem to report, not ours */
        }
      }
      return { folder: d.name, title, count: files.length }
    })
}

function seriesTemplate(folder, title, short) {
  return `{
  "title": ${JSON.stringify(title)},
  "short": ${JSON.stringify(short)},
  "blurb": "One or two sentences describing what this subject covers.",
  "order": 99,
  "accent": null,

  "_howTagsWork": "There is deliberately no 'vocabulary' key yet. Without one, 'npm run docs' infers tags from words that recur across your section titles and prints what it found — write a couple of chapters first, then copy '_vocabularyExample' below to 'vocabulary' and curate it using those terms. Once 'vocabulary' exists it takes over completely and inference stops.",

  "_vocabularyExample": [
    { "tag": "complexity", "match": ["big-o", "time complexity", "space complexity"] },
    { "tag": "interview", "match": ["interview", "cheat sheet"], "weight": 0.5 }
  ],

  "_scoring": "Each chapter is scored against every vocabulary entry: its title counts 10x, section titles 6x, body 1x. The top 3-5 win. 'match' terms are plain words or phrases matched whole-word and case-insensitively — no regex. Give catch-all tags a weight below 1 so a chapter's real subject always outranks them."
}
`
}

function chapterTemplate({ title, chapterLabel, summary }) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)} — Complete Notes</title>
</head>
<body>

<!--
  HOW THIS FILE IS READ
  - Every <div id="secN"> below becomes one section on the site.
  - The <nav class="sidebar"> gives the section ORDER and the group headings.
    Keep its links in sync with the sections; every href="#secN" needs a match.
  - Box classes map to styled callouts:
      note-box  blue-box  tip-box  warn-box  danger-box  purple-box  bonus-box
  - &lt;pre&gt; becomes a syntax-highlighted code block with a copy button.
  - <table> renders responsively; the first all-<th> row becomes the header.
  - A .question-block with a "tag tag-easy|medium|hard|expert" span becomes a
    tagged practice question, auto-linked to the matching answer below.
  - Styling here is irrelevant — only the structure is read. Write freely.
-->

<nav class="sidebar">
  <div class="group-label">Core Concepts</div>
  <a href="#sec1">1. First Section</a>
  <a href="#sec2">2. Second Section</a>
  <div class="group-label">Practice</div>
  <a href="#sec3">3. Practice Sheet</a>
  <a href="#sec4">4. Answer Key</a>
</nav>

<div class="title-block">
  <h1>${esc(title)}</h1>
  <p><strong>Complete Notes + Practice Sheet</strong></p>
  <p>${esc(chapterLabel)}</p>
  <p><em>${esc(summary)}</em></p>
</div>

<div id="sec1">
  <div class="section-header"><h1>1. First Section</h1></div>
  <div class="section-content">
    <div class="danger-box">
      <strong>Lead with the one idea this section exists to land.</strong>
    </div>

    <p>Explain it in prose. Inline <code>code</code> works here.</p>

    <h3>An example:</h3>
<pre>function example() {
  return 'indentation and blank lines are preserved exactly'
}</pre>

    <div class="blue-box">
      <strong>Why?</strong> Use a callout for the insight worth remembering.
    </div>
  </div>
</div>

<div id="sec2">
  <div class="section-header"><h1>2. Second Section</h1></div>
  <div class="section-content">
    <table>
      <tr><th>Thing</th><th>Behaviour</th></tr>
      <tr><td><code>a</code></td><td>What it does</td></tr>
      <tr><td><code>b</code></td><td>What it does</td></tr>
    </table>

    <ul>
      <li>A bullet.</li>
      <li>Another bullet.</li>
    </ul>
  </div>
</div>

<div id="sec3">
  <div class="section-header"><h1>3. Practice Sheet</h1></div>
  <div class="section-content">
    <div class="question-block">
      <strong>Q1.</strong> <span class="tag tag-easy">easy</span>
      A Short Title<br>
      <strong>1)</strong> What is the output?
<pre>// code for the question</pre>
    </div>

    <div class="question-block">
      <strong>Q2.</strong> <span class="tag tag-medium">medium</span>
      Another Title<br>
      <strong>1)</strong> And why?
    </div>
  </div>
</div>

<div id="sec4">
  <div class="section-header"><h1>4. Answer Key</h1></div>
  <div class="section-content">
    <h2>Q1 — Answer</h2>
<pre>the output</pre>
    <p>Why it behaves that way.</p>
    <hr>

    <h2>Q2 — Answer</h2>
    <p>The explanation.</p>
  </div>
</div>

</body>
</html>
`
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })

  /* Prompts must not hang when stdin is a pipe or is closed — otherwise the
     question resolves never, the event loop empties, and the process exits 0
     having silently done nothing. Race every prompt against the interface
     closing and fall back to the default. */
  let closed = false
  rl.on('close', () => {
    closed = true
  })

  const ask = async (q, fallback = '') => {
    if (closed) return fallback
    const answer = await Promise.race([
      rl.question(q),
      once(rl, 'close').then(() => null),
    ]).catch(() => null)
    return (answer ?? '').trim() || fallback
  }

  try {
    const subjects = existingSubjects()

    let folder = argOf('subject')
    if (!folder) {
      console.log('\nSubjects:')
      if (subjects.length) {
        subjects.forEach((s, i) => console.log(`  ${i + 1}. ${s.folder.padEnd(20)} ${s.title}  (${s.count} chapters)`))
      } else {
        console.log('  (none yet)')
      }
      console.log('  or type a new name, e.g. system-design\n')
      const answer = await ask('Subject: ')
      if (!answer) throw new Error('a subject is required')
      const byIndex = subjects[Number(answer) - 1]
      folder = byIndex ? byIndex.folder : slugify(answer)
    } else {
      folder = slugify(folder)
    }

    const dir = join(CONTENT, folder)
    const isNewSubject = !existsSync(dir)

    let title = argOf('title')
    if (!title) title = await ask('Chapter title: ')
    if (!title) throw new Error('a chapter title is required')

    const created = []

    if (isNewSubject) {
      const seriesTitle =
        argOf('series') ||
        (await ask(`Series title for "${folder}" [${titleCase(folder)}]: `, titleCase(folder)))
      // Used as the chip on search results and the "back to" link, so it wants
      // to be short — "DSA" rather than "Data Structures & Algorithms".
      const short = argOf('short') || (await ask(`Short label [${seriesTitle}]: `, seriesTitle))

      mkdirSync(dir, { recursive: true })
      const seriesPath = join(dir, 'series.json')
      writeFileSync(seriesPath, seriesTemplate(folder, seriesTitle, short), 'utf8')
      created.push(seriesPath)
    }

    const existing = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.html'))
    const next = existing.length + 1
    const fileName = fileNameFor(next, title)
    const filePath = join(dir, fileName)

    if (existsSync(filePath)) throw new Error(`${fileName} already exists — pick a different title`)

    writeFileSync(
      filePath,
      chapterTemplate({ title, chapterLabel: `Chapter ${next}`, summary: 'One line describing this chapter.' }),
      'utf8',
    )
    created.push(filePath)

    console.log('')
    for (const p of created) console.log(`  created  ${p.replace(`${REPO}/`, '')}`)
    console.log('')
    if (isNewSubject) {
      console.log(`  New subject "${folder}". Edit content/${folder}/series.json to set its blurb,`)
      console.log(`  its order on /learn, and its tag vocabulary.`)
      console.log('')
    }
    console.log('  Next:')
    console.log(`    1. write the chapter in content/${folder}/${fileName}`)
    console.log('    2. npm run docs       # parse, tag and index it')
    console.log('    3. npm run dev        # see it')
    console.log('')
  } finally {
    rl.close()
  }
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`)
  process.exit(1)
})
