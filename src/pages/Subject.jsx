import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import ChapterCard from '../components/ChapterCard.jsx'
import { Reveal } from '../lib/reveal.jsx'
import { searchChapters, subjectBy, tagsOf, totalsOf } from '../lib/search.js'
import { usePageTitle } from '../lib/title.js'
import { profile } from '../data/profile.js'

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

export default function Subject() {
  const { subject: slug } = useParams()
  const subject = subjectBy(slug)

  const [query, setQuery] = useState('')
  const [tags, setTags] = useState([])
  const inputRef = useRef(null)

  const deferred = useDeferredValue(query)
  const hits = useMemo(
    () => (subject ? searchChapters(deferred, tags, slug) : []),
    [deferred, tags, slug, subject],
  )
  const allTags = useMemo(() => (subject ? tagsOf(slug) : []), [slug, subject])
  const totals = useMemo(() => (subject ? totalsOf(slug) : null), [slug, subject])

  // Reset filters when moving between subjects — a tag from the previous
  // subject would otherwise silently hide everything here.
  useEffect(() => {
    setQuery('')
    setTags([])
  }, [slug])

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

  usePageTitle(subject ? `${subject.series} — ${profile.name}` : null)

  if (!subject) {
    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-[length:var(--text-h2)] font-semibold">Subject not found</h1>
        <p className="mt-3 text-muted">This subject doesn&rsquo;t exist, or was renamed.</p>
        <Link to="/learn" className="mt-6 text-sm text-accent underline underline-offset-4">
          Back to Learn
        </Link>
      </div>
    )
  }

  const toggleTag = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const filtering = query.trim() !== '' || tags.length > 0

  return (
    <div className="shell pb-10">
      <PageHeader eyebrow="Learn" title={subject.series} lead={subject.blurb || undefined}>
        <Reveal as="div" delay={120} className="mt-6">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span> All subjects
          </Link>
        </Reveal>

        <Reveal as="dl" delay={160} className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {[
            [totals.chapters, 'chapters'],
            [totals.sections, 'sections'],
            [totals.questions, 'practice questions'],
            [`${Math.round(totals.minutes / 60) || 1}h`, 'of reading'],
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

      <Reveal className="sticky top-16 z-30 -mx-2 mb-8 bg-bg/85 px-2 py-3 backdrop-blur-xl">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${subject.short}…`}
            aria-label={`Search ${subject.series}`}
            className="w-full rounded-xl border border-line bg-surface py-3 pr-16 pl-11 text-[0.95rem] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-faint">
            /
          </kbd>
        </div>

        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {allTags.map((t) => {
              const on = tags.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    on
                      ? 'border-accent bg-accent text-bg'
                      : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              )
            })}
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setTags([])
                }}
                className="ml-1 text-xs text-faint underline underline-offset-4 hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </Reveal>

      <p className="sr-only" role="status" aria-live="polite">
        {hits.length} {hits.length === 1 ? 'chapter' : 'chapters'} shown
      </p>

      {hits.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line py-20 text-center">
          <p className="text-muted">
            Nothing matches {query.trim() && <span className="text-ink">“{query}”</span>}
            {query.trim() && tags.length > 0 && ' with those tags'}
            {!query.trim() && tags.length > 0 && 'those tags'}.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setTags([])
            }}
            className="mt-3 text-sm text-accent underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {hits.map((hit) => (
            <ChapterCard key={hit.chapter.slug} hit={hit} />
          ))}
        </ul>
      )}
    </div>
  )
}
