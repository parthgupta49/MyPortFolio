import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import ChapterCard from '../components/ChapterCard.jsx'
import { Reveal } from '../lib/reveal.jsx'
import { searchChapters, subjects, totalsOf } from '../lib/search.js'
import { pages } from '../data/pages.js'
import { profile } from '../data/profile.js'
import { usePageTitle } from '../lib/title.js'

function SearchIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  )
}

function ArrowIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

function SubjectCard({ subject }) {
  const accent = subject.accent || 'var(--accent)'

  return (
    <div className="group relative h-full">
      <Link
        to={`/learn/${subject.subject}`}
        className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow)]"
      >
        <span
          className="mb-5 block h-1 w-10 rounded-full transition-all duration-300 group-hover:w-16"
          style={{ background: accent }}
          aria-hidden="true"
        />

        <h2 className="text-[length:var(--text-h3)] font-semibold transition-colors group-hover:text-accent">
          {subject.series}
        </h2>

        {subject.blurb && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{subject.blurb}</p>
        )}

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-faint">
          <div>
            <dt className="sr-only">chapters</dt>
            <dd>
              <span className="font-semibold text-ink tabular-nums">{subject.chapters}</span>{' '}
              chapters
            </dd>
          </div>
          <div>
            <dt className="sr-only">sections</dt>
            <dd>
              <span className="font-semibold text-ink tabular-nums">{subject.sections}</span>{' '}
              sections
            </dd>
          </div>
          {subject.questions > 0 && (
            <div>
              <dt className="sr-only">practice questions</dt>
              <dd>
                <span className="font-semibold text-ink tabular-nums">{subject.questions}</span>{' '}
                questions
              </dd>
            </div>
          )}
        </dl>

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
          Start reading
          <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  )
}

export default function Learn() {
  usePageTitle(`${pages.learn.eyebrow} — ${profile.name}`)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  // Keeps typing responsive: the input updates immediately, the (heavier)
  // filtered list re-renders at React's convenience.
  const deferred = useDeferredValue(query)
  const searching = deferred.trim() !== ''
  const hits = useMemo(() => (searching ? searchChapters(deferred) : []), [deferred, searching])

  const totals = totalsOf(null)

  // "/" focuses search, the way docs sites do.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="shell pb-10">
      <PageHeader
        eyebrow={pages.learn.eyebrow}
        title={pages.learn.title}
        lead={pages.learn.lead}
      >
        <Reveal as="dl" delay={160} className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          {[
            // A "1 subject" counter only advertises how small the library is.
            ...(subjects.length > 1 ? [[subjects.length, 'subjects']] : []),
            [totals.chapters, 'chapters'],
            [totals.sections, 'sections'],
            [`${Math.round(totals.minutes / 60)}h`, 'of reading'],
          ].map(([n, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block text-2xl font-semibold tabular-nums">{n}</span>
                <span className="text-sm text-faint">{label}</span>
              </dd>
            </div>
          ))}
        </Reveal>
      </PageHeader>

      <Reveal className="sticky top-16 z-30 -mx-2 mb-10 bg-bg/85 px-2 py-3 backdrop-blur-xl">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search every subject…"
            aria-label="Search all documentation"
            className="w-full rounded-xl border border-line bg-surface py-3 pr-16 pl-11 text-[0.95rem] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-faint">
            /
          </kbd>
        </div>
      </Reveal>

      {searching ? (
        <>
          <p className="mb-4 text-sm text-faint" role="status" aria-live="polite">
            {hits.length} {hits.length === 1 ? 'chapter' : 'chapters'} match “{deferred}”
          </p>

          {hits.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-line py-20 text-center">
              <p className="text-muted">
                Nothing matches <span className="text-ink">“{deferred}”</span>.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-3 text-sm text-accent underline underline-offset-4"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {hits.map((hit) => (
                <ChapterCard
                  key={`${hit.chapter.subject}/${hit.chapter.slug}`}
                  hit={hit}
                  showSubject
                />
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {subjects.map((s, i) => (
            <Reveal key={s.subject} as="li" delay={Math.min(i, 5) * 70}>
              <SubjectCard subject={s} />
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  )
}
