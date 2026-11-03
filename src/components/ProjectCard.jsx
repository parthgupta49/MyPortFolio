import { Link } from 'react-router-dom'
import Picture from './Picture.jsx'
import { Reveal } from '../lib/reveal.jsx'

/* A `link` starting with "/" is a page on this site and opens in place.
   Anything else is an external live demo and opens in a new tab. */
/* `heading` keeps the outline correct: h3 under a "Selected work" h2 on Home,
   h2 directly under the page title on Projects. `wide` is the lead card that
   spans the full row on tablets, so it asks for a larger image there. */
export default function ProjectCard({ project, heading: Heading = 'h3', wide = false }) {
  const internal = project.link.startsWith('/')
  const Anchor = internal ? Link : 'a'
  const target = internal
    ? { to: project.link }
    : { href: project.link, target: '_blank', rel: 'noreferrer' }

  return (
    <Anchor
      {...target}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow)]"
    >
      <div className="overflow-hidden border-b border-line bg-surface-2">
        <Picture
          name={project.image}
          alt={`Screenshot of ${project.title}`}
          widths={wide ? [400, 800, 1200] : [400, 800]}
          sizes={
            wide
              ? '(min-width: 1024px) 400px, 90vw'
              : '(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw'
          }
          width={800}
          height={500}
          imgClassName="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <Heading className="text-lg font-semibold transition-colors group-hover:text-accent">
          {project.title}
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.blurb}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs text-faint"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Anchor>
  )
}

/* The card grid on Home ("Selected work") and on Projects. Three across on
   desktop. At two columns an odd count would strand the last card, so there
   the lead project takes the full row instead. */
export function ProjectGrid({ projects, heading = 'h3' }) {
  const odd = projects.length % 2 === 1
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => {
        const lead = odd && i === 0
        return (
          <Reveal
            key={p.title}
            delay={Math.min(i, 4) * 70}
            className={lead ? 'sm:col-span-2 lg:col-span-1' : ''}
          >
            <ProjectCard project={p} heading={heading} wide={lead} />
          </Reveal>
        )
      })}
    </div>
  )
}
