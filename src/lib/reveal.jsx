import { useEffect, useRef } from 'react'

/* One IntersectionObserver shared by every revealing element on the page.
   framer-motion used to do this work with a JS animation loop per element;
   here the browser fires once per element and CSS runs the transition on the
   compositor. Elements unobserve themselves after revealing — nothing keeps
   watching content the visitor has already scrolled past. */

let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  )
  return observer
}

export function useReveal(delay = 0) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No IntersectionObserver (or reduced motion): show it immediately.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.classList.add('is-in')
      return
    }

    if (delay) el.style.transitionDelay = `${delay}ms`
    const io = getObserver()
    io.observe(el)
    return () => io.unobserve(el)
  }, [delay])

  return ref
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useReveal(delay)
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
