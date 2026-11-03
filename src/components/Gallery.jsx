import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gallery, galleryTags } from '../data/gallery.js'

/* Tiles are a uniform 4:3 so the grid reads as one tidy set rather than a
   ragged wall — the photos themselves run from a 0.38 newspaper clipping to a
   2.12 panorama. Cropping is only ever in the thumbnail; the lightbox always
   shows the whole, uncropped image. Captions are optional by design: a photo
   without one simply has nothing under it. */

const FILES = import.meta.glob('../assets/optimized/gallery-*.{avif,webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const byName = Object.fromEntries(
  Object.entries(FILES).map(([p, url]) => [p.split('/').pop(), url]),
)

const WIDTHS = [500, 1000, 1600]

const srcset = (name, ext) =>
  WIDTHS.map((w) => {
    const url = byName[`gallery-${name}-${w}.${ext}`]
    return url ? `${url} ${w}w` : null
  })
    .filter(Boolean)
    .join(', ')

const fallback = (name) => byName[`gallery-${name}-1000.jpg`] || byName[`gallery-${name}-500.jpg`]

/** A Drive share link → the embeddable preview URL. */
function driveEmbed(url) {
  const id = url?.match(/\/d\/([^/]+)/)?.[1] || url?.match(/[?&]id=([^&]+)/)?.[1]
  return id ? `https://drive.google.com/file/d/${id}/preview` : null
}

/* A video with no still of its own. Better a designed tile than borrowing a
   photo of a different event, which just mislabels both. */
function VideoPlaceholder({ label }) {
  return (
    <span className="absolute inset-0 grid place-items-center overflow-hidden">
      <span
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(80% 90% at 50% 40%, color-mix(in oklab, var(--accent) 45%, transparent), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <span className="relative flex flex-col items-center gap-3 px-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-bg transition-transform duration-300 group-hover:scale-110">
          <svg
            viewBox="0 0 24 24"
            className="ml-0.5 h-6 w-6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5.2v13.6a.8.8 0 0 0 1.22.68l10.5-6.8a.8.8 0 0 0 0-1.36L9.22 4.52A.8.8 0 0 0 8 5.2Z" />
          </svg>
        </span>
        {label && <span className="text-xs leading-snug text-muted">{label}</span>}
      </span>
    </span>
  )
}

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-bg/70 text-ink backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M8 5.2v13.6a.8.8 0 0 0 1.22.68l10.5-6.8a.8.8 0 0 0 0-1.36L9.22 4.52A.8.8 0 0 0 8 5.2Z" />
        </svg>
      </span>
    </span>
  )
}

function Photo({ item, onOpen, index }) {
  const src = item.image ? fallback(item.image) : null

  // An entry with neither a usable photo nor a video has nothing to show.
  if (!src && !item.video) {
    if (import.meta.env.DEV) {
      console.warn(`[Gallery] no optimized asset for "${item.image}" — run: npm run images`)
    }
    return null
  }

  return (
    <figure className="flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={item.video ? `Play video: ${item.alt}` : `View larger: ${item.alt}`}
      >
        {src ? (
          <>
            <picture>
              <source
                type="image/avif"
                srcSet={srcset(item.image, 'avif')}
                sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
              />
              <source
                type="image/webp"
                srcSet={srcset(item.image, 'webp')}
                sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
              />
              <img
                src={src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
              />
            </picture>
            {item.video && <PlayBadge />}
          </>
        ) : (
          <VideoPlaceholder label={item.alt} />
        )}
      </button>

      {(item.caption || item.date) && (
        <figcaption className="mt-2.5 px-0.5">
          {item.date && <span className="block text-xs tracking-wide text-faint">{item.date}</span>}
          {item.caption && (
            <span className="mt-1 block text-sm leading-relaxed text-muted">{item.caption}</span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

function Lightbox({ items, index, onClose, onStep }) {
  const item = items[index]
  const closeRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const embed = driveEmbed(item?.video)

  // A new photo is a new decision about the video — never carry play state
  // over. A video with no still of its own has nothing to show but the player,
  // so it opens straight into it.
  useEffect(() => setPlaying(!items[index]?.image && !!items[index]?.video), [index, items])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onStep])

  if (!item) return null

  /* Rendered into <body>, not in place. <main> carries z-index:1 for the grain
     layer, which makes it a stacking context — a z-50 overlay inside it still
     sits below the z-40 sticky header, so the header covered the close button
     and there was no way out. A portal escapes that entirely. */
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
    >
      {/* Fixed, not in the flow: with a tall photo a header button can end up
          pushed off screen, leaving no visible way out. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-4 px-5 py-4">
        <span className="rounded-md bg-surface/80 px-2 py-1 text-xs text-faint backdrop-blur-sm tabular-nums">
          {index + 1} / {items.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
          className="pointer-events-auto flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
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
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
          <span>Close</span>
        </button>
      </div>

      {/* Only the media swallows the click. Anything else — the dark space
          around it — dismisses, which is what people expect of a lightbox. */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-5 pt-16">
        {playing && embed ? (
          <iframe
            src={embed}
            title={item.alt}
            allow="autoplay; fullscreen"
            allowFullScreen
            onClick={(e) => e.stopPropagation()}
            className="aspect-video h-auto w-full max-w-4xl rounded-xl border border-line"
          />
        ) : (
          <div
            className="relative flex max-h-full items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <picture>
              <source type="image/avif" srcSet={srcset(item.image, 'avif')} sizes="90vw" />
              <source type="image/webp" srcSet={srcset(item.image, 'webp')} sizes="90vw" />
              <img
                src={fallback(item.image)}
                alt={item.alt}
                className="max-h-[70vh] w-auto rounded-xl object-contain"
              />
            </picture>

            {embed && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 grid place-items-center"
                aria-label={`Play video: ${item.alt}`}
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-bg shadow-[var(--shadow)] transition-transform duration-300 group-hover:scale-110">
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-0.5 h-6 w-6"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5.2v13.6a.8.8 0 0 0 1.22.68l10.5-6.8a.8.8 0 0 0 0-1.36L9.22 4.52A.8.8 0 0 0 8 5.2Z" />
                  </svg>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pt-4 pb-6 text-center" onClick={(e) => e.stopPropagation()}>
        {item.date && <p className="text-xs tracking-wide text-faint">{item.date}</p>}
        {item.caption ? (
          <p className="mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            {item.caption}
          </p>
        ) : (
          <p className="sr-only">{item.alt}</p>
        )}
        {embed && !playing && (
          <p className="mt-2 text-xs text-faint">
            Video loads from Google Drive only when you press play.
          </p>
        )}
        <p className="mt-3 text-xs text-faint">Esc or click outside to close · ← → to move</p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="Previous"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Next"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* Chips are derived from the photos, not hard-coded: a group appears only when
   something carries its tag, so deleting the last photo of a group removes the
   chip too. `galleryTags` supplies the order and the display labels; a tag used
   without an entry there still shows, labelled from its id. */
function useGroups() {
  const used = new Set(gallery.flatMap((item) => item.tags ?? []))
  const known = galleryTags.filter((t) => used.has(t.id))
  const extra = [...used]
    .filter((id) => !galleryTags.some((t) => t.id === id))
    .sort()
    .map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))
  return [...known, ...extra]
}

export default function Gallery() {
  const [open, setOpen] = useState(null)
  const [group, setGroup] = useState('all')

  const groups = useGroups()
  const shown = group === 'all' ? gallery : gallery.filter((i) => (i.tags ?? []).includes(group))

  const step = useCallback(
    (delta) => setOpen((i) => (i === null ? i : (i + delta + shown.length) % shown.length)),
    [shown.length],
  )
  const close = useCallback(() => setOpen(null), [])

  // Switching groups re-indexes everything; keeping an open lightbox would show
  // the wrong photo.
  useEffect(() => setOpen(null), [group])

  if (!gallery.length) return null

  return (
    <>
      {groups.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {[{ id: 'all', label: 'All' }, ...groups].map((g) => {
            const on = group === g.id
            const count =
              g.id === 'all'
                ? gallery.length
                : gallery.filter((i) => (i.tags ?? []).includes(g.id)).length
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroup(g.id)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  on
                    ? 'border-accent bg-accent text-bg'
                    : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink'
                }`}
              >
                {g.label}
                <span className={`ml-1.5 tabular-nums ${on ? 'opacity-70' : 'text-faint'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'photo' : 'photos'} shown
      </p>

      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item, i) => (
          <Photo key={item.image ?? item.video} item={item} index={i} onOpen={setOpen} />
        ))}
      </div>

      {/* The lightbox pages through what's on screen, not the whole set —
          stepping out of the active filter would be disorienting. */}
      {open !== null && <Lightbox items={shown} index={open} onClose={close} onStep={step} />}
    </>
  )
}
