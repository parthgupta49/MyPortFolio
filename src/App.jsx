import { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { chapters } from './lib/search.js'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'

/* Home ships in the main chunk — it's the landing page, and making it wait on
   a second request would cost the very metric we're optimising. Everything
   else is split out and prefetched on link hover. */
const Projects = lazy(() => import('./pages/Projects.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Learn = lazy(() => import('./pages/Learn.jsx'))
const Subject = lazy(() => import('./pages/Subject.jsx'))
const Chapter = lazy(() => import('./pages/Chapter.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

/**
 * Chapters used to live at /learn/<slug>, before subjects existed. That one
 * segment is now the subject, so an old link would land on a subject page that
 * doesn't exist. If the segment is really a chapter slug, send it to its
 * subject; otherwise let the Subject page render its own not-found.
 */
function LegacyChapterRedirect() {
  const { subject: segment } = useParams()
  const { hash } = useLocation()
  const match = chapters.find((c) => c.slug === segment)

  if (match) return <Navigate to={`/learn/${match.subject}/${match.slug}${hash}`} replace />
  return <Subject />
}

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // A hash means "go to this section" — let the browser resolve it once the
    // lazy route has painted, rather than yanking the page to the top.
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function RouteFallback() {
  return (
    <div
      className="shell flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <ScrollManager />
      <Nav />

      <main id="main" className="above-grain flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:subject" element={<LegacyChapterRedirect />} />
            <Route path="/learn/:subject/:slug" element={<Chapter />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
