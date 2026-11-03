import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Link previews (LinkedIn, X, Slack, WhatsApp) need an ABSOLUTE og:image — the
 * crawler fetches the HTML on its own and has no page to resolve a relative
 * path against. But the deployed origin isn't knowable at author time, and
 * committing a guessed domain is worse than having no tag at all.
 *
 * So index.html carries %SITE_URL% and this fills it in from whatever the host
 * actually provides. If nothing does, the four tags that depend on it are
 * removed rather than shipped broken.
 */
function siteUrl() {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    process.env.URL ||                 // Netlify production
    process.env.DEPLOY_PRIME_URL ||    // Netlify branch/preview
    process.env.CF_PAGES_URL ||        // Cloudflare Pages
    ''
  return raw.replace(/\/+$/, '')
}

function absoluteUrls() {
  return {
    name: 'absolute-social-urls',
    transformIndexHtml(html) {
      // The authoring note is for whoever edits index.html, not for crawlers.
      const stripped = html.replace(/[ \t]*<!-- build-note[\s\S]*?-->\n?/g, '')

      const url = siteUrl()
      if (url) return stripped.replaceAll('%SITE_URL%', url)

      // No origin available: drop the tags that require one — including
      // og:image's width/height/alt, which would otherwise be left describing
      // an image that is no longer declared — and step twitter:card down so it
      // stops promising a wide image it cannot supply.
      const ORPHANED = /%SITE_URL%|og:image:/
      return stripped
        .split('\n')
        .filter((line) => !ORPHANED.test(line))
        .join('\n')
        .replace('content="summary_large_image"', 'content="summary"')
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), absoluteUrls()],

  build: {
    // Modern browsers only — no legacy transpilation weight.
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: true,
    // Inline anything under 4kb rather than paying a request for it.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Keep the React runtime in its own chunk so it stays cached
        // across deploys where only site code changes.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
            if (id.includes('react-router')) return 'router'
          }
        },
      },
    },
  },

  server: {
    host: '127.0.0.1',
    port: 3000,
    open: false,
  },
})
