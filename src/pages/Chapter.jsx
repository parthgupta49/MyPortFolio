import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  Block,
  PracticeContext,
  groupAnswers,
  questionTitle,
} from '../components/content/Blocks.jsx'
import VideoEmbed from '../components/content/VideoEmbed.jsx'
import { Inline } from '../lib/inline.jsx'
import { chapterBy, chaptersOf, subjectBy } from '../lib/search.js'
import { videoFor } from '../data/videos.js'
import { usePageTitle } from '../lib/title.js'

/* Chapters are loaded on demand — the 11 files are ~640 KB together, and a
   reader opens one. */
const NOTES = import.meta.glob('../content/*/notes/*.json')

const BADGE = { star: '★', warn: '!', gear: '⚙' }

/* The glyph is decorative, but its native tooltip is not: `title` was showing
   the raw enum, so hovering popped "star" / "warn" / "gear" — the codebase's
   own identifier, in front of a reader. */
const BADGE_LABEL = { star: 'Key idea', warn: 'Common pitfall', gear: 'How it works' }

function useChapter(subject, slug) {
  const [state, setState] = useState({ status: 'loading', note: null })

  useEffect(() => {
    const load = NOTES[`../content/${subject}/notes/${slug}.json`]
    if (!load) {
      setState({ status: 'missing', note: null })
      return
    }

    let alive = true
    setState({ status: 'loading', note: null })
    load()
      .then((m) => alive && setState({ status: 'ready', note: m.default }))
      .catch(() => alive && setState({ status: 'missing', note: null }))

    return () => {
      alive = false
    }
  }, [subject, slug])

  return state
}

/** Highlights the section currently being read. */
function useActiveSection(ids, ready) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!ready || !ids.length) return

    const seen = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e)
        // The topmost section still on screen is the one being read.
        const visible = [...seen.values()]
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-72px 0px -65% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [ids, ready])

  return active
}

/** Thin progress bar across the top of the reader. */
function useReadingProgress(ready) {
  const barRef = useRef(null)

  useEffect(() => {
    if (!ready) return
    let frame = 0

    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct})`
    }

    const onScroll = () => {
      // Coalesce to one write per frame — scroll fires far more often.
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ready])

  return barRef
}

function Toc({ groups, sections, active, onPick }) {
  const titleOf = (id) => sections.find((s) => s.id === id)

  return (
    <nav aria-label="Chapter contents" className="text-sm">
      {groups.map((g) => (
        <div key={g.label} className="mb-5">
          <p className="mb-2 text-[10px] font-semibold tracking-widest text-faint uppercase">
            {g.label}
          </p>
          <ul className="space-y-0.5 border-l border-line">
            {g.sectionIds.map((id) => {
              const s = titleOf(id)
              if (!s) return null
              const on = active === id
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={onPick}
                    aria-current={on ? 'true' : undefined}
                    className={`-ml-px block border-l-2 py-1.5 pl-3 leading-snug transition-colors ${
                      on
                        ? 'border-accent font-medium text-ink'
                        : 'border-transparent text-muted hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    <span className="text-faint tabular-nums">{s.n}.</span> {s.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function Chapter() {
  const { subject: subjectSlug, slug } = useParams()
  const { hash } = useLocation()
  const { status, note } = useChapter(subjectSlug, slug)
  const meta = chapterBy(subjectSlug, slug)
  const subject = subjectBy(subjectSlug)
  const siblings = chaptersOf(subjectSlug)

  const sectionIds = useMemo(() => note?.sections.map((s) => s.id) ?? [], [note])

  /* Answers sit in their own section, so the Answer Key can only label itself
     with each question's title by looking it up across the whole chapter. */
  const practice = useMemo(() => {
    const titles = {}
    for (const section of note?.sections ?? []) {
      for (const block of section.blocks) {
        if (block.t === 'question') titles[block.n] = questionTitle(block.html)
      }
    }
    return { titles }
  }, [note])

  const sections = useMemo(
    () =>
      (note?.sections ?? []).map((section) => ({
        ...section,
        blocks: section.blocks.some((b) => b.t === 'answer')
          ? groupAnswers(section.blocks)
          : section.blocks,
      })),
    [note],
  )
  const active = useActiveSection(sectionIds, status === 'ready')
  const barRef = useReadingProgress(status === 'ready')

  const [tocOpen, setTocOpen] = useState(false)

  const video = videoFor(subjectSlug, slug)
  const position = siblings.findIndex((c) => c.slug === slug)
  const prev = position > 0 ? siblings[position - 1] : null
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null

  usePageTitle(note ? `${note.title} — ${subject?.series ?? 'Learn'}` : null)

  /* Arriving with a #section from search. The app-level scroll handler runs on
     navigation, before this chapter's chunk and JSON have loaded, so the target
     doesn't exist yet and it falls back to scrolling to the top. Re-resolve the
     hash once the sections are actually in the DOM. */
  useEffect(() => {
    if (status !== 'ready' || !hash) return

    const id = hash.slice(1)
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (!el) return
      // <details> answers are collapsed by default; open before scrolling so
      // the link doesn't land on a closed bar.
      if (el.tagName === 'DETAILS') el.open = true
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => cancelAnimationFrame(frame)
  }, [status, hash, subjectSlug, slug])

  if (status === 'missing') {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-[length:var(--text-h2)] font-semibold">Chapter not found</h1>
        <p className="mt-3 text-muted">This chapter doesn&rsquo;t exist, or was renamed.</p>
        <Link to="/learn" className="mt-6 text-sm text-accent underline underline-offset-4">
          Back to Learn
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="shell-wide py-24" role="status" aria-live="polite">
        <span className="sr-only">Loading chapter</span>
        <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
        <div className="mt-5 h-10 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-surface-2"
              style={{ width: `${92 - i * 5}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <PracticeContext.Provider value={practice}>
      <div className="shell-wide">
        {/* progress */}
        <div className="fixed inset-x-0 top-16 z-30 h-0.5 bg-transparent" aria-hidden="true">
          <div
            ref={barRef}
            className="h-full origin-left bg-accent"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {/* Contents sits in the left column, the way the source notes do.
            The article still comes FIRST in the DOM — grid placement moves it
            visually, so screen readers and search engines reach the chapter
            before the navigation. */}
        <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <article className="min-w-0 max-w-[46rem] pt-14 pb-8 lg:col-start-2 lg:row-start-1">
            <Link
              to={`/learn/${subjectSlug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <span aria-hidden="true">←</span> {subject?.short ?? 'Back'}
            </Link>

            <header className="mt-6 border-b border-line pb-8">
              <p className="text-xs font-medium tracking-widest text-accent uppercase">
                {note.chapterLabel}
              </p>
              <h1 className="mt-3 text-[length:var(--text-h1)] font-semibold">{note.title}</h1>
              <p className="mt-4 text-[length:var(--text-lead)] leading-relaxed text-muted">
                <Inline html={note.summary} />
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-faint">
                {meta && (
                  <>
                    <span>{meta.readingMinutes} min read</span>
                    <span aria-hidden="true">·</span>
                    <span>{meta.sectionCount} sections</span>
                    {meta.questionCount > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{meta.questionCount} practice questions</span>
                      </>
                    )}
                  </>
                )}
                <ul className="flex flex-wrap gap-1.5">
                  {note.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line bg-surface-2 px-2 py-0.5"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </header>

            {/* Contents on small screens, where the sidebar is hidden. */}
            <details
              open={tocOpen}
              onToggle={(e) => setTocOpen(e.currentTarget.open)}
              className="my-6 rounded-xl border border-line bg-surface px-5 py-3 lg:hidden"
            >
              <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                Contents ({note.sections.length})
              </summary>
              <div className="mt-4">
                <Toc
                  groups={note.groups}
                  sections={note.sections}
                  active={active}
                  onPick={() => setTocOpen(false)}
                />
              </div>
            </details>

            {video && <VideoEmbed video={video} />}

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 pt-10">
                <h2 className="flex items-start gap-2.5 text-[length:var(--text-h2)] font-semibold">
                  {section.badge && (
                    <span
                      className="mt-1.5 shrink-0 text-base text-accent"
                      aria-hidden="true"
                      title={BADGE_LABEL[section.badge] ?? ''}
                    >
                      {BADGE[section.badge] ?? ''}
                    </span>
                  )}
                  <span>
                    <span className="text-faint tabular-nums">{section.n}.</span> {section.title}
                  </span>
                </h2>

                <div className="mt-4">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}

            {/* companions */}
            {meta?.companions?.length > 0 && (
              <aside className="mt-16 rounded-[var(--radius-card)] border border-line bg-surface p-6">
                <p className="text-xs font-medium tracking-widest text-faint uppercase">
                  Read alongside
                </p>
                <ul className="mt-3 space-y-2">
                  {meta.companions.map((s) => {
                    const c = chapterBy(subjectSlug, s)
                    return c ? (
                      <li key={s}>
                        <Link
                          to={`/learn/${subjectSlug}/${s}`}
                          className="text-accent underline underline-offset-4"
                        >
                          {c.title}
                        </Link>
                      </li>
                    ) : null
                  })}
                </ul>
              </aside>
            )}

            {/* prev / next */}
            <nav
              className="mt-12 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
              aria-label="Chapter navigation"
            >
              {prev ? (
                <Link
                  to={`/learn/${subjectSlug}/${prev.slug}`}
                  className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
                >
                  <p className="text-xs text-faint">← Previous</p>
                  <p className="mt-1 font-medium transition-colors group-hover:text-accent">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to={`/learn/${subjectSlug}/${next.slug}`}
                  className="group rounded-xl border border-line bg-surface p-5 text-right transition-colors hover:border-line-strong sm:col-start-2"
                >
                  <p className="text-xs text-faint">Next →</p>
                  <p className="mt-1 font-medium transition-colors group-hover:text-accent">
                    {next.title}
                  </p>
                </Link>
              )}
            </nav>
          </article>

          <aside className="hidden lg:col-start-1 lg:row-start-1 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pt-14 pb-10">
              <Toc groups={note.groups} sections={note.sections} active={active} />
            </div>
          </aside>
        </div>
      </div>
    </PracticeContext.Provider>
  )
}
