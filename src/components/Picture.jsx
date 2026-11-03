/* Serves AVIF, then WebP, then JPEG, at the widths actually rendered.
   width/height are always emitted so the box is reserved before the bytes
   land — no layout shift. */

const FILES = import.meta.glob('../assets/optimized/*.{avif,webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** '../assets/optimized/portrait-320.avif' → url, keyed 'portrait-320.avif' */
const byName = Object.fromEntries(
  Object.entries(FILES).map(([p, url]) => [p.split('/').pop(), url]),
)

function srcset(name, widths, ext) {
  return widths
    .map((w) => {
      const url = byName[`${name}-${w}.${ext}`]
      return url ? `${url} ${w}w` : null
    })
    .filter(Boolean)
    .join(', ')
}

export default function Picture({
  name,
  alt,
  widths = [400, 800],
  sizes = '400px',
  width,
  height,
  className = '',
  imgClassName = '',
  priority = false,
}) {
  const fallback = byName[`${name}-${widths.at(-1)}.jpg`]

  if (!fallback) {
    // Missing optimized output: fail visibly in dev rather than render a
    // broken <img>, and stay silent-but-empty in production.
    if (import.meta.env.DEV) {
      console.warn(`[Picture] no optimized asset for "${name}" — run: npm run images`)
    }
    return null
  }

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcset(name, widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(name, widths, 'webp')} sizes={sizes} />
      <img
        src={fallback}
        srcSet={srcset(name, widths, 'jpg')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={imgClassName}
      />
    </picture>
  )
}
