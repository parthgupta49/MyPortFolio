import { Reveal } from '../lib/reveal.jsx'

export default function PageHeader({ eyebrow, title, lead, children }) {
  return (
    <header className="py-16 md:py-20">
      {eyebrow && (
        <Reveal as="p" className="mb-4 text-xs font-medium tracking-widest text-accent uppercase">
          {eyebrow}
        </Reveal>
      )}

      <Reveal as="h1" delay={60} className="max-w-3xl text-[length:var(--text-h1)] font-semibold">
        {title}
      </Reveal>

      {lead && (
        <Reveal
          as="p"
          delay={120}
          className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-muted"
        >
          {lead}
        </Reveal>
      )}

      {children}
    </header>
  )
}
