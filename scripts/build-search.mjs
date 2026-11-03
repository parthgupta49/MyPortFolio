#!/usr/bin/env node
/**
 * Builds the client search index from the generated chapter JSON.
 *
 * Searching only chapter titles would miss the useful case — "TDZ", "microtask",
 * "mark and sweep" are section titles, not chapter titles. Searching full bodies
 * would mean shipping the whole library to the browser just to type in a box.
 *
 * So the index carries chapter metadata plus every section heading: a few KB,
 * and it makes the deepest heading in any subject reachable in one keystroke.
 *
 * Run via `npm run docs` (chained after the parser) or directly: node scripts/build-search.mjs
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { decodeEntities } from '../src/lib/entities.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(root, 'src/content')

/** Strip the inline tags the content parser allows, leaving searchable text.
 *  Entities are decoded too: this output is consumed as PLAIN TEXT (card
 *  summaries, document.title, the search haystack), so "&amp;" left encoded
 *  would both display wrong and break a search for "&". */
const text = (s = '') =>
  decodeEntities(s.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()

async function main() {
  const { subjects } = JSON.parse(await readFile(path.join(CONTENT, 'subjects.json'), 'utf8'))

  const out = { subjects: [], chapters: [] }

  for (const s of subjects) {
    const index = JSON.parse(await readFile(path.join(CONTENT, s.subject, 'index.json'), 'utf8'))
    const notesDir = path.join(CONTENT, s.subject, 'notes')
    const files = (await readdir(notesDir)).filter((f) => f.endsWith('.json'))

    const bySlug = new Map()
    for (const f of files) {
      const note = JSON.parse(await readFile(path.join(notesDir, f), 'utf8'))
      bySlug.set(note.slug, note)
    }

    out.subjects.push({
      subject: s.subject,
      series: s.series,
      short: s.short,
      blurb: s.blurb,
      accent: s.accent,
      order: s.order,
      chapters: s.chapters,
      sections: s.sections,
      questions: s.questions,
      minutes: s.minutes,
    })

    for (const c of index.chapters) {
      const note = bySlug.get(c.slug)
      if (!note) throw new Error(`${s.subject}/index.json lists "${c.slug}" but no note file exists`)

      out.chapters.push({
        subject: s.subject,
        subjectName: s.short,
        slug: c.slug,
        order: c.order,
        title: text(c.title),
        chapterLabel: c.chapterLabel,
        summary: text(c.summary),
        tags: c.tags,
        readingMinutes: c.readingMinutes,
        sectionCount: c.sectionCount,
        questionCount: c.questionCount,
        codeCount: c.codeCount,
        companions: c.companions,
        sections: note.sections.map((sec) => ({ id: sec.id, n: sec.n, title: text(sec.title) })),
      })
    }
  }

  const file = path.join(CONTENT, 'search.json')
  await writeFile(file, JSON.stringify(out))

  const bytes = Buffer.byteLength(JSON.stringify(out))
  const sections = out.chapters.reduce((n, c) => n + c.sections.length, 0)
  console.log(
    `  search index: ${out.subjects.length} subject(s), ${out.chapters.length} chapters, ` +
      `${sections} sections, ${(bytes / 1024).toFixed(1)} KB`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
