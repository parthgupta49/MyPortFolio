import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/title.js'
import { profile } from '../data/profile.js'

export default function NotFound() {
  usePageTitle(`Page not found — ${profile.name}`)
  return (
    <div className="shell flex min-h-[68vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium tracking-widest text-accent uppercase">404</p>
      <h1 className="mt-4 text-[length:var(--text-h1)] font-semibold">
        This page doesn&rsquo;t exist
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        The link may be old, or slightly mistyped. Everything on the site is one of these three:
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/learn"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5"
        >
          Learn
        </Link>
        <Link
          to="/projects"
          className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          Projects
        </Link>
        <Link
          to="/about"
          className="rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          About
        </Link>
      </div>
    </div>
  )
}
