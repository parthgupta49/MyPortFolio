import { Link } from 'react-router-dom'

/* The card is one big click target, but the matched section headings have to
   stay individually clickable — a heading that says "this is where your match
   is" and then drops you at the top of a 20-minute chapter is worse than not
   showing it at all.
   Nested <a> is invalid, so the title link is stretched over the card with a
   pseudo-element and the section links are lifted above it on the z-axis. */
export default function ChapterCard({ hit, showSubject = false }) {
  const { chapter: c, sections } = hit
  const base = `/learn/${c.subject}/${c.slug}`

  return (
    <li className="group relative rounded-[var(--radius-card)] border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow)]">
      <div className="flex gap-5">
        <span
          className="hidden shrink-0 text-[2.6rem] leading-none font-semibold text-line-strong transition-colors duration-300 group-hover:text-accent tabular-nums sm:block"
          aria-hidden="true"
        >
          {String(c.order).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-xs font-medium tracking-widest text-faint uppercase">
            {showSubject && (
              <>
                <span className="text-accent">{c.subjectName}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            {c.chapterLabel}
          </p>

          <h2 className="mt-1.5 text-[length:var(--text-h3)] font-semibold">
            <Link
              to={base}
              className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
            >
              {c.title}
            </Link>
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{c.summary}</p>

          {sections.length > 0 && (
            <ul className="relative z-10 mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`${base}#${s.id}`}
                    className="text-xs text-accent-text underline-offset-2 hover:underline"
                    title={`Jump to “${s.title}”`}
                  >
                    <span className="text-faint">§</span> {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-faint">
            <span>{c.readingMinutes} min</span>
            <span aria-hidden="true">·</span>
            <span>{c.sectionCount} sections</span>
            {c.questionCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{c.questionCount} questions</span>
              </>
            )}
            <ul className="ml-auto flex flex-wrap gap-1.5">
              {c.tags.slice(0, 3).map((t) => (
                <li key={t} className="rounded-full border border-line bg-surface-2 px-2 py-0.5">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </li>
  )
}
