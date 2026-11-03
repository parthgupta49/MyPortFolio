import { createContext, useContext, useEffect, useState } from 'react'
import { Inline } from '../../lib/inline.jsx'
import { TOKEN_CLASS, tokenize } from '../../lib/highlight.js'

/* Question and answer live in different sections (Practice Sheet / Answer Key),
   so the pair is linked by number rather than by nesting. The chapter supplies
   the question titles so the Answer Key stays scannable when collapsed. */
export const PracticeContext = createContext({ titles: {} })

/** The question's own title: the text before the first <br>, tags stripped. */
export function questionTitle(html = '') {
  return html
    .split(/<br\s*\/?>/i)[0]
    .replace(/<[^>]+>/g, '')
    .trim()
}

/* ── code ─────────────────────────────────────────────────────── */

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked (insecure context / denied permission).
      // The code is selectable; silently doing nothing is the right fallback.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      className="absolute top-2.5 right-2.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-muted opacity-0 transition-all duration-150 group-hover/code:opacity-100 focus-visible:opacity-100 hover:text-ink"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function CodeBlock({ code, label }) {
  return (
    <figure className="group/code relative my-5">
      {label && (
        <figcaption className="mb-1.5 text-xs font-medium tracking-wide text-faint">
          {label}
        </figcaption>
      )}
      <div className="relative overflow-hidden rounded-xl border border-line bg-[var(--code-bg)]">
        <CopyButton text={code} />
        <pre className="overflow-x-auto p-4 text-[0.855rem] leading-[1.65]">
          <code>
            {tokenize(code).map((t, i) => (
              <span key={i} className={TOKEN_CLASS[t.type]}>
                {t.value}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  )
}

/* ── callouts ─────────────────────────────────────────────────── */

const CALLOUT = {
  note: { color: 'var(--note)', label: 'Note' },
  info: { color: 'var(--info)', label: 'Detail' },
  tip: { color: 'var(--tip)', label: 'Tip' },
  warn: { color: 'var(--warn)', label: 'Careful' },
  danger: { color: 'var(--danger)', label: 'Important' },
  key: { color: 'var(--key)', label: 'Key idea' },
  bonus: { color: 'var(--bonus)', label: 'Bonus' },
}

export function Callout({ kind, html }) {
  const { color, label } = CALLOUT[kind] ?? CALLOUT.note
  return (
    <aside
      className="my-5 rounded-r-xl border-l-[3px] py-3.5 pr-4 pl-4"
      style={{
        borderColor: color,
        background: `color-mix(in oklab, ${color} 7%, transparent)`,
      }}
    >
      <p className="mb-1.5 text-[11px] font-semibold tracking-widest uppercase" style={{ color }}>
        {label}
      </p>
      <div className="leading-relaxed text-muted [&_strong]:text-ink">
        <Inline html={html} />
      </div>
    </aside>
  )
}

/* ── table ────────────────────────────────────────────────────── */

export function ContentTable({ head, rows }) {
  return (
    <div className="my-6 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[34rem] border-collapse overflow-hidden rounded-xl border border-line text-sm">
        {head?.length > 0 && (
          <thead>
            <tr className="bg-surface-2">
              {head.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="border-b border-line px-4 py-2.5 text-left font-semibold text-ink"
                >
                  <Inline html={h} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-line last:border-0 hover:bg-surface-2/50">
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-2.5 align-top text-muted">
                  <Inline html={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── practice ─────────────────────────────────────────────────── */

const DIFFICULTY = {
  easy: 'var(--easy)',
  medium: 'var(--medium)',
  hard: 'var(--hard)',
  expert: 'var(--expert)',
  bonus: 'var(--bonus)',
}

function ArrowDown({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v13M6 13l6 6 6-6" />
    </svg>
  )
}

export function Question({ n, difficulty, html, code }) {
  const color = DIFFICULTY[difficulty] ?? 'var(--note)'
  const title = questionTitle(html)

  /* Open the matching answer before the browser jumps to it, so following the
     link lands on a revealed answer rather than a collapsed bar. */
  const reveal = () => {
    const el = document.getElementById(`a${n}`)
    if (el) el.open = true
  }

  return (
    <div id={`q${n}`} className="my-5 scroll-mt-24 rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-faint tabular-nums">Q{n}</span>
        {difficulty && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
            style={{
              color,
              background: `color-mix(in oklab, ${color} 13%, transparent)`,
            }}
          >
            {difficulty}
          </span>
        )}
      </div>

      <div className="leading-relaxed [&_strong]:text-ink">
        <Inline html={html} />
      </div>

      {code && <CodeBlock code={code} />}

      <a
        href={`#a${n}`}
        onClick={reveal}
        className="group mt-4 inline-flex items-center gap-1.5 text-sm text-accent underline-offset-4 hover:underline"
        aria-label={`See the answer to question ${n}${title ? `: ${title}` : ''}`}
      >
        See answer
        <ArrowDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
      </a>
    </div>
  )
}

/**
 * The parser emits `answer` as a MARKER — its body is the blocks that follow it,
 * up to the next marker. So the collapsible has to be built from that run, not
 * from the marker's own html (which is just the label, e.g. "Q1").
 */
export function Answer({ n, blocks = [] }) {
  const { titles } = useContext(PracticeContext)
  const [open, setOpen] = useState(false)
  const title = titles?.[n]

  // Deep links (/learn/x#a3) and in-page "See answer" clicks both land here.
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#a${n}`) setOpen(true)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [n])

  return (
    <details
      id={`a${n}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group/ans my-2.5 scroll-mt-24 overflow-hidden rounded-xl border border-line bg-surface"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 transition-colors marker:content-none hover:bg-surface-2">
        <span className="text-sm font-semibold text-faint tabular-nums">Q{n}</span>
        {title && <span className="min-w-0 flex-1 truncate text-sm text-ink">{title}</span>}
        <span className="ml-auto text-xs text-faint transition-opacity group-open/ans:opacity-0">
          Show
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-faint transition-transform duration-200 group-open/ans:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-line px-5 pt-1 pb-4">
        {blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        <a
          href={`#q${n}`}
          className="group mt-3 inline-flex items-center gap-1.5 text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V6M6 11l6-6 6 6" />
          </svg>
          Back to question {n}
        </a>
      </div>
    </details>
  )
}

/**
 * Fold each `answer` marker and the blocks after it into one collapsible.
 * Trailing rules are separators between answers, not part of them.
 */
export function groupAnswers(blocks) {
  const out = []
  let current = null

  for (const block of blocks) {
    if (block.t === 'answer') {
      current = { ...block, children: [] }
      out.push(current)
      continue
    }
    if (current) {
      current.children.push(block)
      continue
    }
    out.push(block)
  }

  for (const block of out) {
    if (!block.children) continue
    while (block.children.at(-1)?.t === 'hr') block.children.pop()
  }

  return out
}

/* ── dispatcher ───────────────────────────────────────────────── */

export function Block({ block }) {
  switch (block.t) {
    case 'p':
      return (
        <p className="my-4 leading-[1.75] text-muted [&_strong]:text-ink">
          <Inline html={block.html} />
        </p>
      )

    case 'h': {
      const Tag = block.level === 2 ? 'h3' : 'h4'
      const size = block.level === 2 ? 'text-[length:var(--text-h3)] mt-9' : 'text-[1.02rem] mt-7'
      return (
        <Tag className={`${size} mb-2 font-semibold text-ink`}>
          <Inline html={block.html} />
        </Tag>
      )
    }

    case 'code':
      return <CodeBlock code={block.code} label={block.label} />

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag
          className={`my-4 space-y-1.5 pl-5 leading-[1.7] text-muted marker:text-faint [&_strong]:text-ink ${
            block.ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Inline html={item} />
            </li>
          ))}
        </Tag>
      )
    }

    case 'callout':
      return <Callout kind={block.kind} html={block.html} />

    case 'table':
      return <ContentTable head={block.head} rows={block.rows} />

    case 'question':
      return (
        <Question n={block.n} difficulty={block.difficulty} html={block.html} code={block.code} />
      )

    case 'answer':
      return <Answer n={block.n} blocks={block.children} />

    case 'hr':
      return <hr className="my-8 border-line" />

    default:
      return null
  }
}
