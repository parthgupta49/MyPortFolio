import { ProjectGrid } from '../components/ProjectCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import LinkArrow from '../components/LinkArrow.jsx'
import { Reveal } from '../lib/reveal.jsx'
import { usePageTitle } from '../lib/title.js'
import { projects } from '../data/projects.js'
import { pages } from '../data/pages.js'
import { profile } from '../data/profile.js'

/* Smaller, older work: still live and worth a click, but listed compactly so it
   doesn't sit at the same weight as the main projects. */
function EarlierProject({ project }) {
  return (
    <li>
      <a
        href={project.link}
        target="_blank"
        rel="noreferrer"
        className="group grid gap-1 py-5 sm:grid-cols-[13rem_1fr_auto] sm:items-baseline sm:gap-8"
      >
        <span className="font-medium transition-colors group-hover:text-accent">
          {project.title}
          <LinkArrow />
        </span>
        <span className="text-sm leading-relaxed text-muted">{project.blurb}</span>
        <span className="text-xs text-faint">{project.tags.join(' · ')}</span>
      </a>
    </li>
  )
}

export default function Projects() {
  usePageTitle(`${pages.projects.eyebrow} — ${profile.name}`)
  const main = projects.filter((p) => !p.earlier)
  const earlier = projects.filter((p) => p.earlier)

  return (
    <div className="shell-wide pb-10">
      <PageHeader
        eyebrow={pages.projects.eyebrow}
        title={pages.projects.title}
        lead={pages.projects.lead}
      />

      <ProjectGrid projects={main} heading="h2" />

      {earlier.length > 0 && (
        <Reveal as="section" className="mt-20 border-t border-line pt-12">
          <h2 className="mb-2 text-xs font-medium tracking-widest text-faint uppercase">
            Earlier projects
          </h2>
          <ul className="divide-y divide-line">
            {earlier.map((p) => (
              <EarlierProject key={p.title} project={p} />
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  )
}
