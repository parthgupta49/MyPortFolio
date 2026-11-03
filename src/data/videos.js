/* Per-chapter video. Kept OUT of the generated content JSON on purpose:
 * `npm run docs` rewrites src/content/ from scratch, and anything you set
 * there would be lost. This file is yours and is never rewritten.
 *
 * Key   = "<subject>/<chapter-slug>" — the same two segments as the chapter's
 *         URL, so /learn/javascript/closures-in-javascript is keyed
 *         'javascript/closures-in-javascript'. Slugs are listed in
 *         src/content/<subject>/index.json.
 * id    = the YouTube video id — the part after ?v=
 * title = used for the accessible label and the facade caption
 * start = optional, seconds to start at
 *
 * Example:
 *   'javascript/closures-in-javascript': { id: 'dQw4w9WgXcQ', title: 'Closures, explained' },
 */

export const videos = {
  // 'javascript/closures-in-javascript': { id: 'VIDEO_ID', title: 'Closures, explained' },
}

export function videoFor(subject, slug) {
  const v = videos[`${subject}/${slug}`]
  return v && v.id ? v : null
}
