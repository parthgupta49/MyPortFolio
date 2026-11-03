import { useState } from 'react'

/* A YouTube iframe costs roughly 1MB and a pile of third-party requests the
 * moment it mounts — more than this entire site. So we render a facade and
 * only mount the real player when the visitor asks for it.
 *
 * Nothing is requested from YouTube until that click, and the player itself is
 * loaded from youtube-nocookie.com. */

export default function VideoEmbed({ video }) {
  const [playing, setPlaying] = useState(false)
  if (!video) return null

  const src =
    `https://www.youtube-nocookie.com/embed/${video.id}` +
    `?autoplay=1&rel=0&modestbranding=1${video.start ? `&start=${video.start}` : ''}`

  return (
    <figure className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-surface-2">
        {playing ? (
          <iframe
            src={src}
            title={video.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 grid w-full place-items-center"
            aria-label={`Play video: ${video.title || 'watch this chapter'}`}
          >
            <div
              className="absolute inset-0 opacity-55"
              style={{
                background:
                  'radial-gradient(70% 90% at 50% 40%, color-mix(in oklab, var(--accent) 26%, transparent), transparent 70%)',
              }}
              aria-hidden="true"
            />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-accent text-bg shadow-[var(--shadow)] transition-transform duration-300 group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-6 w-6"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5.2v13.6a.8.8 0 0 0 1.22.68l10.5-6.8a.8.8 0 0 0 0-1.36L9.22 4.52A.8.8 0 0 0 8 5.2Z" />
              </svg>
            </span>
            {video.title && (
              <span className="absolute bottom-4 left-5 right-5 text-left text-sm font-medium text-ink">
                {video.title}
              </span>
            )}
          </button>
        )}
      </div>
      {!playing && (
        <figcaption className="mt-2 text-xs text-faint">
          Video loads from YouTube only when you press play.
        </figcaption>
      )}
    </figure>
  )
}
