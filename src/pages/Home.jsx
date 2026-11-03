import { Link } from 'react-router-dom'
import Picture from '../components/Picture.jsx'
import Icon from '../components/Icon.jsx'
import { ProjectGrid } from '../components/ProjectCard.jsx'
import { Reveal } from '../lib/reveal.jsx'
import { profile, socials, stack } from '../data/profile.js'
import { projects } from '../data/projects.js'
import { subjects, totalsOf } from '../lib/search.js'

function ArrowIcon({ className = '' }) {
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

function Hero() {
  return (
    <section className="shell-wide pt-20 pb-28 md:pt-28">
      <div className="grid items-center gap-14 md:grid-cols-[1.35fr_1fr]">
        <div>
          <Reveal as="p" className="mb-5 text-sm font-medium tracking-widest text-accent uppercase">
            {profile.headline}
          </Reveal>

          <Reveal
            as="h1"
            delay={60}
            className="text-[length:var(--text-display)] leading-[0.94] font-semibold"
          >
            Hi, I&rsquo;m
            <br />
            <span className="text-accent">{profile.first}</span>.
          </Reveal>

          <Reveal as="div" delay={120} className="mt-6 text-[length:var(--text-lead)] text-muted">
            <span>I build </span>
            {/* Screen readers get the whole list once; the animation is visual only.
                (aria-label on a plain span is ignored by most screen readers.) */}
            <span className="sr-only">{profile.builds.join(', ')}</span>
            <span className="rotator font-medium text-ink" aria-hidden="true">
              {profile.builds.map((b) => (
                <span key={b}>{b}</span>
              ))}
            </span>
          </Reveal>

          <Reveal
            as="p"
            delay={180}
            className="mt-6 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-muted"
          >
            {profile.tagline}
          </Reveal>

          <Reveal as="div" delay={240} className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/learn"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5"
            >
              Read the docs
              <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Resume
            </a>
          </Reveal>

          <Reveal as="ul" delay={300} className="mt-10 flex items-center gap-1">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Icon name={s.icon} className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </Reveal>
        </div>

        {/* Centred in its own column. Pinning it to the column's end left a
            256px gap between the text and the photo, which read as misaligned
            rather than as deliberate whitespace. */}
        <Reveal delay={140} className="justify-self-center">
          <div className="relative h-[17rem] w-[17rem] sm:h-[19rem] sm:w-[19rem]">
            {/* Static gradient ring. The old build animated a 20px blur on an
                infinite loop — this is the same look for no runtime cost. */}
            <div
              className="absolute -inset-5 rounded-full opacity-45 blur-2xl"
              style={{
                background:
                  'conic-gradient(from 200deg, var(--accent), var(--tip), var(--key), var(--accent))',
              }}
              aria-hidden="true"
            />
            <Picture
              name="portrait"
              alt={`${profile.name}, smiling, in a suit`}
              widths={[320, 640]}
              sizes="(min-width: 640px) 19rem, 17rem"
              width={640}
              height={640}
              priority
              className="relative block h-full w-full"
              imgClassName="h-full w-full rounded-full object-cover ring-1 ring-line-strong"
            />
          </div>
        </Reveal>
      </div>

      <Reveal
        as="ul"
        delay={360}
        className="mt-24 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:justify-start"
      >
        {stack.map((s) => (
          <li
            key={s.label}
            className="group flex items-center gap-2.5 text-muted transition-colors hover:text-ink"
          >
            <Icon name={s.icon} className="h-6 w-6" />
            <span className="text-sm">{s.label}</span>
          </li>
        ))}
      </Reveal>
    </section>
  )
}

function LearnBanner() {
  const { chapters, sections, minutes } = totalsOf(null)
  const names = subjects.map((s) => s.short)

  return (
    <Reveal as="section" className="shell-wide py-16">
      <Link
        to="/learn"
        className="group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-8 transition-colors hover:border-accent/50 md:p-12"
      >
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-widest text-accent uppercase">Learn</p>
            <h2 className="mt-3 text-[length:var(--text-h2)] font-semibold">
              {names.length === 1 ? subjects[0].series : 'Technical documentation'}
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              {names.length === 1
                ? subjects[0].blurb
                : `In-depth documentation on ${names.slice(0, -1).join(', ')} and ${names.at(-1)} — written while learning each one properly.`}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Start reading
              <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>

          <dl className="flex gap-10">
            {[
              [chapters, 'chapters'],
              [sections, 'sections'],
              [`${Math.round(minutes / 60)}h`, 'of reading'],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold tabular-nums">{n}</span>
                  <span className="text-sm text-faint">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>
    </Reveal>
  )
}

function FeaturedWork() {
  const featured = projects.filter((p) => p.featured)

  return (
    <section className="shell-wide py-16">
      <Reveal as="div" className="mb-10 flex items-end justify-between gap-6">
        <h2 className="text-[length:var(--text-h2)] font-semibold">Selected work</h2>
        <Link
          to="/projects"
          className="group inline-flex shrink-0 items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          All projects
          <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <ProjectGrid projects={featured} />
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <LearnBanner />
      <FeaturedWork />
    </>
  )
}
