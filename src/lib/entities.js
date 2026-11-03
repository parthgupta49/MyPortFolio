/* HTML entity decoding, shared by the renderer and the search-index build.
 *
 * The notes are authored as HTML, so a literal "&" is written "&amp;" and a
 * literal "<" is written "&lt;". The parser must KEEP those escaped inside an
 * `html` field — unescaping "<" there would turn it into a tag. So decoding has
 * to happen at the point the text stops being markup and becomes words:
 * in the inline renderer, and in the plain-text search index.
 *
 * Without this, "Event Loop &amp; Callback Queue" reaches the page as those
 * literal characters and the reader sees "&amp;".
 */

const NAMED = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  times: '×',
  middot: '·',
  deg: '°',
  rarr: '→',
  larr: '←',
  harr: '↔',
  hArr: '⇔',
  check: '✓',
  copy: '©',
}

const PATTERN = /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g

/**
 * One pass, so "&amp;lt;" correctly yields the literal text "&lt;" rather than
 * being decoded twice into "<". A sequential replace of &amp; first would get
 * that wrong.
 */
export function decodeEntities(input) {
  if (typeof input !== 'string' || !input.includes('&')) return input

  return input.replace(PATTERN, (match, body) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10)
      // Reject anything outside Unicode, and the surrogate range.
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match
      if (code >= 0xd800 && code <= 0xdfff) return match
      try {
        return String.fromCodePoint(code)
      } catch {
        return match
      }
    }
    // Unknown named entity: leave it exactly as written rather than guessing.
    return Object.prototype.hasOwnProperty.call(NAMED, body) ? NAMED[body] : match
  })
}
