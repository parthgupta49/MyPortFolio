import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'

/* "Learn" sits to the left of "Projects" deliberately — the docs are the
   deepest thing on the site, so they get first position and, via `emphasis`,
   the accent colour and a slightly heavier weight. Quiet on purpose. */
const LINKS = [
  { to: '/learn', label: 'Learn', emphasis: true, load: () => import('../pages/Learn.jsx') },
  { to: '/projects', label: 'Projects', load: () => import('../pages/Projects.jsx') },
  { to: '/about', label: 'About', load: () => import('../pages/About.jsx') },
]

function SunIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6L17 17M7 7 5.4 5.4" />
    </svg>
  )
}

function MoonIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
    </svg>
  )
}

function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      title={`Switch to ${next} theme`}
      aria-label={`Switch to ${next} theme`}
      className={`grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-ink ${className}`}
    >
      {theme === 'dark' ? (
        <MoonIcon className="h-[18px] w-[18px]" />
      ) : (
        <SunIcon className="h-[18px] w-[18px]" />
      )}
    </button>
  )
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Don't let the page scroll behind the open mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass =
    (emphasis) =>
    ({ isActive }) =>
      `relative py-1 text-[0.95rem] transition-colors ${
        emphasis ? 'font-medium text-accent' : isActive ? 'text-ink' : 'text-muted hover:text-ink'
      } after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-accent after:transition-all ${
        isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
      }`

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-bg/80 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="shell-wide flex h-16 items-center justify-between gap-6" aria-label="Main">
        <NavLink
          to="/"
          className="group flex items-baseline gap-1.5 text-[0.98rem] font-semibold tracking-tight"
        >
          <span>Parth Gupta</span>
          <span className="pulse h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-150" />
        </NavLink>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <li key={l.to}>
                {/* Warm the route chunk on hover so the click feels instant. */}
                <NavLink
                  to={l.to}
                  className={linkClass(l.emphasis)}
                  onMouseEnter={l.load}
                  onFocus={l.load}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <ThemeToggle />

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-bg md:hidden">
          <ul className="shell-wide flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `block border-b border-line py-3.5 text-lg ${isActive ? 'text-accent' : 'text-ink'} ${
                      l.emphasis ? 'font-medium' : ''
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
