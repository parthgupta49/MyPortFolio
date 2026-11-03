import index from '../content/search.json'

export const subjects = index.subjects
export const chapters = index.chapters

export const subjectBy = (slug) => subjects.find((s) => s.subject === slug)
export const chaptersOf = (slug) => chapters.filter((c) => c.subject === slug)
export const chapterBy = (subject, slug) =>
  chapters.find((c) => c.subject === subject && c.slug === slug)

/** Every tag in a subject, most-used first — drives that subject's filter row. */
export function tagsOf(subjectSlug) {
  const pool = subjectSlug ? chaptersOf(subjectSlug) : chapters
  const count = (t) => pool.filter((c) => c.tags.includes(t)).length
  return [...new Set(pool.flatMap((c) => c.tags))].sort(
    (a, b) => count(b) - count(a) || a.localeCompare(b),
  )
}

export function totalsOf(subjectSlug) {
  const pool = subjectSlug ? chaptersOf(subjectSlug) : chapters
  return {
    chapters: pool.length,
    sections: pool.reduce((n, c) => n + c.sectionCount, 0),
    questions: pool.reduce((n, c) => n + c.questionCount, 0),
    minutes: pool.reduce((n, c) => n + c.readingMinutes, 0),
  }
}

/**
 * Rank chapters against a query, optionally within one subject.
 *
 * Deliberately not fuzzy: these are technical terms, and fuzzy matching turns
 * "this" into a match for everything. Substring matching on word boundaries
 * keeps results predictable, which matters more than cleverness here.
 *
 * Returns chapters in relevance order, each with the section headings that
 * matched so the UI can deep-link straight to them.
 */
export function searchChapters(query, activeTags = [], subjectSlug = null) {
  const q = query.trim().toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)

  let pool = subjectSlug ? chaptersOf(subjectSlug) : chapters
  if (activeTags.length) {
    pool = pool.filter((c) => activeTags.every((t) => c.tags.includes(t)))
  }

  if (!terms.length) {
    return pool.map((c) => ({ chapter: c, score: 0, sections: [] }))
  }

  const hits = []

  for (const c of pool) {
    let score = 0
    const matched = []

    const title = c.title.toLowerCase()
    const summary = c.summary.toLowerCase()
    const tagline = c.tags.join(' ').toLowerCase()
    // Searching across subjects, "javascript" should find the JS chapters.
    const subjectName = (c.subjectName || '').toLowerCase()

    for (const term of terms) {
      let termHit = false

      if (title.includes(term)) {
        score += title.startsWith(term) ? 40 : 28
        termHit = true
      }
      if (tagline.includes(term)) {
        score += 18
        termHit = true
      }
      if (subjectName.includes(term)) {
        score += 10
        termHit = true
      }
      if (summary.includes(term)) {
        score += 8
        termHit = true
      }

      for (const s of c.sections) {
        if (s.title.toLowerCase().includes(term)) {
          score += 12
          termHit = true
          if (!matched.some((m) => m.id === s.id)) matched.push(s)
        }
      }

      // Every term must land somewhere, so multi-word queries narrow
      // rather than widen the result set.
      if (!termHit) {
        score = -1
        break
      }
    }

    if (score > 0) hits.push({ chapter: c, score, sections: matched.slice(0, 4) })
  }

  return hits.sort(
    (a, b) =>
      b.score - a.score ||
      a.chapter.subject.localeCompare(b.chapter.subject) ||
      a.chapter.order - b.chapter.order,
  )
}
