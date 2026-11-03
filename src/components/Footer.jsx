import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { profile, socials } from '../data/profile.js'

export default function Footer() {
  return (
    <footer className="above-grain mt-32 border-t border-line py-10">
      <div className="shell-wide flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm text-faint">
          © {new Date().getFullYear()} {profile.name}
        </p>

        <ul className="flex items-center gap-2">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                title={s.label}
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Icon name={s.icon} className="h-[17px] w-[17px]" />
              </a>
            </li>
          ))}
        </ul>

        <nav className="flex gap-5 text-sm text-faint" aria-label="Footer">
          <Link to="/learn" className="transition-colors hover:text-ink">
            Learn
          </Link>
          <Link to="/projects" className="transition-colors hover:text-ink">
            Projects
          </Link>
          <Link to="/about" className="transition-colors hover:text-ink">
            About
          </Link>
        </nav>
      </div>
    </footer>
  )
}
