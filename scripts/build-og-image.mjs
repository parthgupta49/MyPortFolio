#!/usr/bin/env node
/**
 * Generates the social preview card at public/og.png (1200x630).
 *
 * index.html declares twitter:card="summary_large_image", which promises a wide
 * image. Without one, pasting the site into LinkedIn, X, Slack or WhatsApp
 * unfurls with an empty image slot — the first thing a recruiter sees.
 *
 * Run with `npm run og` after changing the name, role or portrait.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const W = 1200
const H = 630

const NAME = 'Parth Gupta'
const ROLE = 'JavaScript Developer at LTM'
const LINE = 'Projects · The JavaScript Codex · Writing'

// Same tokens as the site's dark theme, so the card and the page agree.
const BG = '#08090c'
const INK = '#e9ebef'
const MUTED = '#99a1af'
const ACCENT = '#6ea8fe'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="78%" cy="38%" r="52%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${ACCENT}"/>
  <text x="90" y="250" font-family="Helvetica,Arial,sans-serif" font-size="82" font-weight="700" fill="${INK}">${esc(NAME)}</text>
  <text x="90" y="318" font-family="Helvetica,Arial,sans-serif" font-size="36" font-weight="500" fill="${ACCENT}">${esc(ROLE)}</text>
  <text x="90" y="392" font-family="Helvetica,Arial,sans-serif" font-size="27" fill="${MUTED}">${esc(LINE)}</text>
  <circle cx="90" cy="476" r="7" fill="${ACCENT}"/>
  <text x="112" y="485" font-family="Helvetica,Arial,sans-serif" font-size="24" fill="${MUTED}">parthgupta49</text>
</svg>`

const portrait = path.join(root, 'src/assets/optimized/portrait-640.jpg')

async function main() {
  const avatar = await sharp(portrait)
    .resize(300, 300, { fit: 'cover' })
    .composite([
      {
        input: Buffer.from(
          `<svg><circle cx="150" cy="150" r="150" fill="#fff"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const out = path.join(root, 'public/og.png')
  await mkdir(path.dirname(out), { recursive: true })
  await sharp(Buffer.from(svg))
    .composite([{ input: avatar, top: 165, left: 800 }])
    .png()
    .toFile(out)

  const { size } = await sharp(out).metadata().then(async (m) => ({ ...m, size: (await import('node:fs/promises')).stat }))
  console.log(`  og image: public/og.png  ${W}x${H}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
