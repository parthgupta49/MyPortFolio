import { useEffect } from 'react'

/* Must match <title> in index.html — it's what Home shows, and what every
   page puts back when it unmounts. */
const SITE_TITLE = 'Parth Gupta — Developer'

/** Sets the browser-tab title while a page is mounted and restores the site
 *  title on leave. Pass a falsy title (a chapter still loading) to keep the
 *  site title until there's something real to show. */
export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = title
    return () => {
      document.title = SITE_TITLE
    }
  }, [title])
}
