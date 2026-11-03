import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import Gallery from '../components/Gallery.jsx'
import LinkArrow from '../components/LinkArrow.jsx'
import { Reveal } from '../lib/reveal.jsx'
import { usePageTitle } from '../lib/title.js'
import { pages } from '../data/pages.js'
import { gallery } from '../data/gallery.js'
import {
  about,
  awards,
  certifications,
  education,
  experience,
  profile,
  skills,
  socials,
  stack,
} from '../data/profile.js'

/* One accent treatment, used for both a standout award and an education grade,
   so "this is the bit worth noticing" looks the same everywhere. */
const HIGHLIGHT = 'inline-block rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text'

/* One Recognition or Certification entry. Both lists use it, so the sidebar
   reads as one system: a title, a muted detail line, an optional result pill
   (the same pill as an education grade, so pills only ever hold a number), and,
   only when there's evidence, a separate "View certificate ↗" link.

   The link is its own line rather than an underlined title: a long title that
   wraps stays clean, and the accent text + arrow says "clickable" at rest, which
   matters on phones where nothing can be hovered. Its padding keeps the tap
   target at least 24px tall. */
function Credential({ title, detail, result, id, link, linkLabel = 'View certificate' }) {
  return (
    <li className="text-sm leading-relaxed">
      <p className="font-medium text-ink">{title}</p>
      {detail && <p className="text-muted">{detail}</p>}
      {result && (
        <p className="mt-1.5">
          <span className={`${HIGHLIGHT} text-xs tabular-nums`}>{result}</span>
        </p>
      )}
      {id && <p className="mt-0.5 text-xs text-faint tabular-nums">ID {id}</p>}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          aria-label={`${linkLabel}: ${title} (opens in a new tab)`}
          className="group mt-0.5 inline-block py-1 text-xs font-medium text-accent underline-offset-[0.3em] hover:underline"
        >
          {linkLabel}
          <LinkArrow />
        </a>
      )}
    </li>
  )
}

/* One timeline entry. Experience and Education share it — an education entry
   is just a shorter one: a title, a place, and a result instead of bullets.
   `compact` tightens it for the narrow sidebar column. */
function TimelineItem({
  title,
  place,
  from,
  to,
  current,
  summary,
  points,
  tech,
  result,
  compact = false,
}) {
  return (
    <li
      className={`relative border-l border-line last:pb-0 ${compact ? 'pb-7 pl-5' : 'pb-10 pl-7'}`}
    >
      <span
        className={`absolute top-1.5 rounded-full ${compact ? '-left-[4px] h-2 w-2' : '-left-[5px] h-2.5 w-2.5'} ${
          current ? 'bg-accent' : 'bg-line-strong'
        }`}
        aria-hidden="true"
      />

      <p className="text-xs font-medium tracking-widest text-faint uppercase">
        {from} — {to}
      </p>

      <h3
        className={`mt-1.5 font-semibold ${compact ? 'text-sm' : 'text-[length:var(--text-h3)]'}`}
      >
        {title}
      </h3>
      <p className={`text-accent ${compact ? 'text-xs' : 'text-sm'}`}>{place}</p>

      {result && (
        <p className="mt-2">
          <span className={`${HIGHLIGHT} text-xs tabular-nums`}>{result}</span>
        </p>
      )}

      {summary && <p className="mt-3 leading-relaxed text-muted">{summary}</p>}

      {points?.length > 0 && (
        <ul className="mt-4 space-y-2">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong"
                aria-hidden="true"
              />
              {point}
            </li>
          ))}
        </ul>
      )}

      {tech && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs text-faint"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default function About() {
  usePageTitle(`${pages.about.eyebrow} — ${profile.name}`)

  return (
    <div className="shell pb-10">
      <PageHeader
        eyebrow={pages.about.eyebrow}
        title={`I'm ${profile.name}.`}
        lead={pages.about.lead}
      />

      <div className="grid gap-16 md:grid-cols-[1.6fr_1fr] md:gap-20">
        <div className="space-y-14">
          <div className="space-y-12">
            {about.map((block, i) => (
              <Reveal key={block.heading} delay={i * 70} as="section">
                <h2 className="mb-3 text-xs font-medium tracking-widest text-faint uppercase">
                  {block.heading}
                </h2>
                <p className="text-[length:var(--text-lead)] leading-relaxed text-muted">
                  {block.body}
                </p>
              </Reveal>
            ))}
          </div>

          {experience.length > 0 && (
            <Reveal as="section">
              <h2 className="mb-6 text-xs font-medium tracking-widest text-faint uppercase">
                Experience
              </h2>
              <ul>
                {experience.map((job) => (
                  <TimelineItem
                    key={`${job.company}-${job.role}`}
                    title={job.role}
                    place={job.company}
                    from={job.from}
                    to={job.to}
                    current={job.current}
                    summary={job.summary}
                    points={job.points}
                    tech={job.tech}
                  />
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal as="div" className="flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5"
            >
              Read the docs
            </Link>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Resume
            </a>
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Email me
              </a>
            )}
          </Reveal>
        </div>

        <aside className="space-y-10">
          <Reveal>
            <h2 className="mb-4 text-xs font-medium tracking-widest text-faint uppercase">
              Works with
            </h2>
            <ul className="space-y-3">
              {stack.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-muted">
                  <Icon name={s.icon} className="h-[18px] w-[18px]" />
                  <span className="text-sm">{s.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {skills.length > 0 && (
            <Reveal delay={60}>
              <h2 className="mb-4 text-xs font-medium tracking-widest text-faint uppercase">
                Skills
              </h2>
              <dl className="space-y-3">
                {skills.map((s) => (
                  <div key={s.group}>
                    <dt className="text-xs text-faint">{s.group}</dt>
                    <dd className="text-sm leading-relaxed text-muted">{s.items.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          {education.length > 0 && (
            <Reveal delay={120}>
              <h2 className="mb-4 text-xs font-medium tracking-widest text-faint uppercase">
                Education
              </h2>
              <ul>
                {education.map((e) => (
                  <TimelineItem
                    key={`${e.school}-${e.qualification}`}
                    title={e.qualification}
                    place={e.school}
                    from={e.from}
                    to={e.to}
                    result={e.result}
                    compact
                  />
                ))}
              </ul>
            </Reveal>
          )}

          {awards.length > 0 && (
            <Reveal delay={180}>
              <h2 className="mb-4 text-xs font-medium tracking-widest text-faint uppercase">
                Recognition
              </h2>
              <ul className="space-y-5">
                {awards.map((a) => {
                  const item = typeof a === 'string' ? { title: a } : a
                  return <Credential key={item.title} {...item} />
                })}
              </ul>
            </Reveal>
          )}

          {certifications.length > 0 && (
            <Reveal delay={210}>
              <h2 className="mb-4 text-xs font-medium tracking-widest text-faint uppercase">
                Certifications
              </h2>
              <ul className="space-y-5">
                {certifications.map((c) => (
                  <Credential
                    key={c.name}
                    title={c.name}
                    detail={[c.issuer, c.date].filter(Boolean).join(' · ')}
                    id={c.id}
                    link={c.link}
                    linkLabel="Show credential"
                  />
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal delay={240}>
            <h2 className="mb-4 text-xs font-medium tracking-widest text-faint uppercase">
              Elsewhere
            </h2>
            <ul className="space-y-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 text-sm text-muted transition-colors hover:text-ink"
                  >
                    <Icon name={s.icon} className="h-[18px] w-[18px]" />
                    <span className="underline-offset-4 group-hover:underline">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </div>

      {gallery.length > 0 && (
        <Reveal as="section" className="mt-24 border-t border-line pt-14">
          <h2 className="text-xs font-medium tracking-widest text-faint uppercase">Gallery</h2>
          <p className="mt-3 mb-10 max-w-2xl leading-relaxed text-muted">
            Talks, competitions, classrooms and a few things in between.
          </p>
          <Gallery />
        </Reveal>
      )}
    </div>
  )
}
