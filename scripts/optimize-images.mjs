#!/usr/bin/env node
/**
 * Source images are 1200–2560px wide and shipped as-is into slots that render
 * at 320px (portrait) and ~380px (project cards) — about 3.4 MB of payload for
 * roughly 200 KB of actual pixels.
 *
 * This generates AVIF + WebP + a JPEG fallback at the sizes really used, at 1x
 * and 2x. Run it with `npm run images`. Output is committed, so a normal build
 * never needs sharp.
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(root, 'src/assets/optimized')

/**
 * Widths are the rendered CSS size and its 2x retina counterpart.
 *
 * `position` decides which part survives the crop. Do NOT use sharp's
 * 'attention' strategy on a portrait: it picks the highest-contrast region,
 * which on a face against a white backdrop skews toward the hair/glasses and
 * shaves unevenly off one side — it cropped this 2560x2104 source down to a
 * square by taking more from the left, leaving the subject visibly pushed to
 * the right inside the circle. A plain centre crop keeps the subject centred
 * and is deterministic, so the same source always yields the same crop.
 */
const JOBS = [
  {
    src: 'src/assets/ParthGupta_2.jpg',
    name: 'portrait',
    widths: [320, 640],
    fit: 'cover',
    ratio: 1,
    position: 'centre',
  },
  {
    dir: 'src/assets/projectImages',
    // 1200 is for the lead card, which spans the full row on tablets.
    widths: [400, 800, 1200],
    fit: 'cover',
    ratio: 16 / 10,
    // Screenshots read top-down; keep the header rather than the footer.
    position: 'top',
  },
  {
    // Gallery photos keep their own shape — `ratio: null` means no crop, so a
    // panorama stays a panorama and a newspaper clipping stays tall. The
    // masonry layout is built for exactly that. 1600 feeds the full-screen view.
    dir: 'src/assets/gallery',
    prefix: 'gallery-',
    widths: [500, 1000, 1600],
    fit: 'inside',
    ratio: null,
  },
]

const AVIF = { quality: 52, effort: 6 }
const WEBP = { quality: 74, effort: 5 }
const JPEG = { quality: 78, progressive: true, mozjpeg: true }

async function emit(input, base, widths, fit, ratio, position = 'centre') {
  const results = []
  for (const w of widths) {
    const h = ratio ? Math.round(w / ratio) : null
    const pipe = () =>
      sharp(input).resize({
        width: w,
        height: h ?? undefined,
        fit,
        position,
        withoutEnlargement: true,
      })

    const [avif, webp, jpeg] = await Promise.all([
      pipe().avif(AVIF).toBuffer(),
      pipe().webp(WEBP).toBuffer(),
      pipe().jpeg(JPEG).toBuffer(),
    ])

    await Promise.all([
      writeFile(path.join(OUT, `${base}-${w}.avif`), avif),
      writeFile(path.join(OUT, `${base}-${w}.webp`), webp),
      writeFile(path.join(OUT, `${base}-${w}.jpg`), jpeg),
    ])

    results.push({ w, h, avif: avif.length, webp: webp.length, jpeg: jpeg.length })
  }
  return results
}

async function main() {
  await mkdir(OUT, { recursive: true })

  let before = 0
  let after = 0
  const rows = []

  for (const job of JOBS) {
    const files = job.dir
      ? (await readdir(path.join(root, job.dir)))
          .filter((f) => /\.(png|jpe?g)$/i.test(f))
          .map((f) => path.join(root, job.dir, f))
      : [path.join(root, job.src)]

    for (const file of files) {
      if (!existsSync(file)) {
        console.warn(`  skip (missing): ${path.relative(root, file)}`)
        continue
      }
      const base = (job.prefix ?? '') + (job.name ?? path.basename(file).replace(/\.[^.]+$/, ''))
      const meta = await sharp(file).metadata()
      // metadata() doesn't report file size for every format — stat the file.
      const bytes = (await stat(file)).size
      before += bytes

      const out = await emit(file, base, job.widths, job.fit, job.ratio, job.position)
      // A modern browser takes the AVIF at 2x; that's the honest "after" cost.
      after += out.at(-1).avif

      rows.push({
        base,
        from: `${meta.width}x${meta.height} ${(bytes / 1024).toFixed(0)}KB`,
        to: out.map((o) => `${o.w}w avif ${(o.avif / 1024).toFixed(0)}KB`).join(', '),
      })
    }
  }

  for (const r of rows) console.log(`  ${r.base.padEnd(24)} ${r.from.padEnd(22)} → ${r.to}`)
  console.log(
    `\n  ${rows.length} images: ${(before / 1024 / 1024).toFixed(2)} MB → ` +
      `${(after / 1024).toFixed(0)} KB served (AVIF @2x)`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
