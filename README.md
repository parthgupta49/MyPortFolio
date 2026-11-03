# Parth Gupta — Portfolio

Personal site: projects, an about page, and **Learn** — in-depth technical documentation on whatever
I'm studying properly, published as browsable, searchable chapters.

Built with **Vite 8**, **React 19**, **Tailwind CSS 4** and **React Router 7**. No UI framework, no
animation library, no CMS, no backend, no database.

## Documentation

Everything about this project is written down in the repo, so nothing depends on memory.

| File | Answers |
| --- | --- |
| **README.md** (this file) | *How do I…?* Run it, add content, edit any page, deploy, share it |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | *How does it work, and why is it built this way?* Pipeline, parser, reader, search, images, SEO, performance, limitations |
| [docs/DECISIONS.md](docs/DECISIONS.md) | *Why is it like this?* Every decision, dated, with what was tried and rejected |
| [docs/ROADMAP.md](docs/ROADMAP.md) | *What's left?* Plan status, open items, future work in recommended order |
| [docs/PLAN.md](docs/PLAN.md) | My plan for this rebuild, kept as written |

**When you change something, update the doc that describes it in the same commit.** A doc that
disagrees with the code is worse than no doc.

## Project status

- **v2** (this rebuild) is committed on `main`. **v1**, the original Create React App site, is
  tagged `v1`; `git checkout v1` brings its code back.
- **Live site:** https://portfolio-parthgupta.vercel.app/, deployed by Vercel from `main` on every
  push to [parthgupta49/MyPortFolio](https://github.com/parthgupta49/MyPortFolio). As of 2026-11-04,
  v2 isn't pushed yet, so the live site still shows v1. See [Publishing](#publishing).
- The step-by-step development history is on the local branch `revamp`. **Never push that branch.**
- Open items and next steps: [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Contents

- [Running it](#running-it)
- [Scripts](#scripts)
- [Adding content](#adding-content) — **the part you'll use most**
  - [Add a chapter](#add-a-chapter-to-an-existing-subject)
  - [Add a new subject](#add-a-new-subject)
  - [Add a video](#add-a-video-to-a-chapter)
- [How tags work](#how-tags-work)
- [Writing a chapter](#writing-a-chapter)
- [Editing the rest of the site](#editing-the-rest-of-the-site)
- [How it's built](#how-its-built)
- [Deploying](#deploying)
- [Publishing](#publishing)
- [Sharing a copy](#sharing-a-copy)
- [Before you publish](#before-you-publish)
- [Code style](#code-style)
- [Gotchas](#gotchas)

---

## Running it

Needs **Node 20.19+** (Node 24 recommended). **nvm is not required** — this project runs on the
system Node.

```bash
npm install
npm run dev
```

Opens on http://127.0.0.1:3000.

> **If `npm install` fails with `E401 — Unable to authenticate`:** that's a machine-level registry
> being inherited (for example a corporate CodeArtifact mirror in `~/.npmrc`) on a project that has
> only public dependencies. This repo pins the public registry in its own `.npmrc`, which overrides
> it. If you ever need it manually: `npm install --registry https://registry.npmjs.org/`

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload (`npm start` is the same) |
| `npm run new` | Scaffold a chapter — and a subject, if it's new |
| `npm run docs` | Parse every subject into JSON + rebuild the search index |
| `npm run build` | Runs `docs`, then builds to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run images` | Regenerate optimized AVIF/WebP/JPEG image variants |
| `npm run og` | Regenerate the social preview card `public/og.png`. Run after changing your name, role or portrait. |

---

# Adding content

**You never need to edit anything in `src/` to publish a chapter.** Two commands cover everything.

## Add a chapter to an existing subject

```bash
npm run new
```

It lists your subjects, asks which one and for a title, then writes a templated HTML file with the
callout, code, table and practice markup already in place — and a comment block at the top
explaining what each piece becomes. Files are auto-numbered (`12_…` after an existing 11).

Write the chapter, then publish it:

```bash
npm run docs
```

That parses it, derives its tags, counts sections/code/questions, computes reading time, and rebuilds
the search index. Refresh the browser — it's live.

Non-interactive equivalent:

```bash
npm run new -- --subject=javascript --title="Debouncing and Throttling"
```

## Add a new subject

The same command. Give it a subject name that doesn't exist yet:

```bash
npm run new
# Subject: system-design          ← doesn't exist? it gets created
# Chapter title: Load Balancing
# Series title for "system-design" [System Design]:
# Short label [System Design]: SysDesign
```

That creates `content/system-design/` with a `series.json` and your first chapter.

**Subjects are just folders** — the parser discovers them, so nothing needs registering. Once it has
a chapter it appears as a card on `/learn`, with `/learn/system-design` listing its chapters and
`/learn/system-design/load-balancing` as the reader.

Non-interactive equivalent (every prompt has a flag):

```bash
npm run new -- --subject=dsa --title="Big-O" --series="Data Structures & Algorithms" --short=DSA
```

Then open `content/<subject>/series.json` and set the `blurb`, the `order` it appears in on `/learn`,
and optionally an `accent` colour (any CSS colour, used for the stripe on its card).

| Field | What it's for |
| --- | --- |
| `title` | Full series name, shown as the card and page heading |
| `short` | Compact label — the chip on search results and the "back to" link |
| `blurb` | One or two sentences on the subject card |
| `order` | Position on `/learn` (lower first) |
| `accent` | Optional CSS colour for the card stripe; `null` uses the site accent |
| `vocabulary` | Optional — see below |

## Add a video to a chapter

Videos live in **`src/data/videos.js`**, deliberately *outside* the generated content because
`npm run docs` wipes and rewrites `src/content/` on every run.

```js
export const videos = {
  'javascript/closures-in-javascript': { id: 'VIDEO_ID', title: 'Closures, explained' },
}
```

- **Key** is `<subject>/<chapter-slug>` — the same two segments as the chapter's URL.
- **`id`** is the YouTube id: the part after `?v=`.
- **`title`** is used for the caption and the accessible label.
- **`start`** is optional, in seconds.

No rebuild needed — it's plain app code, so the dev server picks it up immediately.

The player is a **facade**: the page shows a play button and requests *nothing* from YouTube until
the visitor clicks it, then loads from `youtube-nocookie.com`. Measured: 0 requests before the click,
1 after. A live embed costs roughly 1 MB — more than this entire site.

---

## How tags work

Tags are not AI and not magic, so they're worth understanding — they drive the filter row on each
subject page.

Each subject *may* declare a vocabulary in its `series.json`:

```json
"vocabulary": [
  { "tag": "closures", "match": ["closure", "closures"] },
  { "tag": "async",    "match": ["event loop", "promise", "await", "microtask"] },
  { "tag": "interview", "match": ["interview", "cheat sheet"], "weight": 0.5 }
]
```

`match` entries are **plain words or phrases** — no regex to write. They're matched whole-word and
case-insensitively. Every chapter is scored against every entry:

> **chapter title × 10** · **section titles × 6** · **body × 1**

and the top 3–5 win. Give catch-all tags (`interview`, `practice`) a `weight` below 1 so a chapter's
real subject always outranks them. Because all chapters in a subject share one vocabulary, the same
concept always yields the same tag string instead of drifting into dozens of one-offs.

### Starting a subject without writing a vocabulary

You don't have to write one up front, and a freshly scaffolded `series.json` deliberately **doesn't
include** a `vocabulary` key. Without one, tags are **inferred** from words that recur across that
subject's own section titles, and the build tells you:

```
Data Structures & Algorithms  (content/dsa)   [tags inferred]
  big-o-and-complexity-analysis      big-o,complexity,answer
  - dsa: no vocabulary in series.json — tags inferred from section titles.
    Curate them by pasting a "vocabulary" block into content/dsa/series.json.
```

So the intended path is: **write two or three chapters → run `npm run docs` → read the terms it
found → paste them into `vocabulary` and curate.** You're never staring at a blank config.

Once a `vocabulary` key exists it takes over completely and inference stops.

---

## Writing a chapter

The parser reads **structure, not styling** — style the source HTML however you like, all CSS is
ignored. Two layouts are supported and detected per file: collapsible `.section-header` sections
(with a `<nav class="sidebar">` supplying order and group headings), or plain top-level `<h1>`s.

| You write | You get |
| --- | --- |
| `<div id="secN">` + `.section-header` | A section, listed in the Contents rail |
| `<nav class="sidebar">` with `.group-label` | Section order and the grouped Contents rail |
| `note-box` `blue-box` `tip-box` `warn-box` `danger-box` `purple-box` `bonus-box` | Themed callouts |
| `<pre>` | Syntax-highlighted code with a copy button |
| `<code>` | Inline code chip |
| `<table>` | Responsive table; a first all-`<th>` row becomes the header |
| `.question-block` + `<span class="tag tag-easy">` | Tagged practice question, auto-linked to its answer |
| `<h2>Qn — Answer</h2>` | Collapsible answer in the Answer Key, linked back to the question |
| `🔗 Companion file: <title>` in the title block | A cross-link between two chapters |

Difficulty tags: `tag-easy` `tag-medium` `tag-hard` `tag-expert` `tag-bonus`.

Questions and answers are paired **by number**, so `Q3` in the practice sheet automatically links to
answer 3 in the Answer Key and back again. You don't write those links.

---

## Editing the rest of the site

**Everything you'd want to reword lives in `src/data/`. You should never need to open a component
to change text.** Five files, no build step — the dev server hot-reloads them instantly.

| File | Owns |
| --- | --- |
| `src/data/profile.js` | You: name, roles, tagline, email, About prose, experience, education, skills, recognition, socials, stack |
| `src/data/gallery.js` | The photo gallery at the bottom of About |
| `src/data/projects.js` | The Projects grid |
| `src/data/pages.js` | The heading + intro line at the top of About, Projects and Learn |
| `src/data/videos.js` | Per-chapter videos |
| `src/index.css` | Colours, type scale, spacing, radius (the `:root` token blocks) |

### The About page

All of it comes from `profile.js`. Each export renders its own section:

| Export | Renders as |
| --- | --- |
| `profile` | Name; `headline`, the label above your name on Home; `builds`, the three phrases that rotate after "I build" (keep exactly three); tagline; résumé link; email |
| `about` | The prose blocks — add, remove or reorder freely, each is `{ heading, body }` |
| `experience` | The work timeline. Newest first; `current: true` gives it the accent dot |
| `education` | The education timeline in the sidebar. A `result` is shown as an accent pill |
| `skills` | Grouped skill lists — `{ group, items: [] }` |
| `awards` | The Recognition list — see below |
| `certifications` | The Certifications panel. Hidden entirely while empty |
| `socials` | The Elsewhere links, and the icon row in the hero and footer |
| `stack` | The icon strip under the hero and the "Works with" panel on About |

**Add a job:**

```js
export const experience = [
  {
    company: 'Somewhere New',
    role: 'Senior Developer',
    from: 'Jan 2027',
    to: 'Present',
    current: true,              // accent dot; set false/remove on the old one
    summary: 'One line on what the role was about.',
    points: ['What you did.', 'What it achieved.'],
    tech: ['React', 'Go'],      // optional chips
  },
  // …older roles below
]
```

**Add a prose block:**

```js
export const about = [
  { heading: 'Now', body: '…' },
  { heading: 'Side projects', body: '…' },   // new sections just work
]
```

**Remove a section entirely** — delete its entries and the heading disappears with them. An empty
`awards` array renders no Recognition panel.

**Hide the email button** — set `email: null` in `profile`.

**Stack icons** are keyed by name and must exist in `src/components/Icon.jsx`. Currently available:
`javascript` `react` `node` `python` `aws` `mongodb` `tailwind` `java` `github` `linkedin`
`twitter` `medium` `leetcode`. To add one, import it from
[react-icons](https://react-icons.github.io/react-icons/) and add a line to the `ICONS` map.

**Add a qualification** — `education` uses the same timeline as `experience`:

```js
export const education = [
  {
    school: 'Christ (Deemed to be University), Bangalore',
    qualification: 'Bachelor of Computer Applications',
    from: '2022',
    to: '2025',
    result: 'CGPA 9.26 / 10',   // optional
  },
  // …older ones below
]
```

### Recognition

Every entry renders the same way as a certification, so the sidebar reads as one list: a **title**,
a muted **detail** line, and optionally a **result** pill and a link to the evidence.

```js
export const awards = [
  {
    title: 'Meritorious Scholarship',   // required
    detail: 'CHRIST · 2023–24',         // optional — who, when, what for
    result: 'GPA 3.97 / 4',             // optional — the accent pill
    link: 'https://…',                  // optional — adds "View certificate ↗"
    linkLabel: 'Read the post',         // optional — different wording for that link
  },
  { title: 'Best Trainee', detail: 'LTM' },
  'Speaker, Dev Meetup',                // a plain string is just a title
]
```

- **`result`** is the same accent pill as an education grade. **Keep it to a number or a grade**
  (`GPA 3.97 / 4`, `1st place`). A pill wrapped around a whole sentence becomes a heavy block.
- **`link`** is for evidence: a certificate, a post, a write-up. It adds a separate accent-coloured
  **"View certificate ↗"** line under the entry, rather than underlining the title. That keeps long,
  wrapping titles clean, and it reads as clickable without hovering, which matters on phones. Its
  tap target is 24px tall, and screen readers hear which entry it opens and that it opens a new
  tab.
- An entry **without** a link has no link styling at all.

Newest first. The styling lives in one place, `Credential` in `src/pages/About.jsx`, and both
Recognition and Certifications use it.

### Certifications

**The whole section is hidden while the array is empty.** Add one entry and it appears.

```js
export const certifications = [
  {
    name: 'AWS Academy Cloud Foundations',   // required
    issuer: 'AWS Academy',                   // optional
    date: '2024',                            // optional
    id: '82078',                             // optional — credential number
    link: 'https://…',                       // optional — makes the name clickable
  },
]
```

Only `name` is required. `issuer` and `date` render together on one line; `id` shows beneath as
`ID 82078`. With a `link`, a **"Show credential ↗"** line appears under it, in the same style as
Recognition's "View certificate ↗".

### The Gallery

Photos at the bottom of About in a uniform grid — every tile is 4:3 so the set reads tidily even
though the photos themselves range from a tall newspaper clipping to a wide panorama. **Cropping
only ever happens in the thumbnail**; clicking a photo opens the whole, uncropped image full-screen.

In the full-screen view: **Esc** or a click outside closes it, **← →** move between photos, and
there's an explicit Close button. (It renders through a portal onto `<body>` — `<main>` carries a
z-index for the grain layer, which would otherwise trap the overlay beneath the sticky header.)

**Adding a photo is three steps:**

```bash
# 1. drop the file into src/assets/gallery/     e.g. hackathon-win.jpg
npm run images
```

```js
// 2. add an entry to src/data/gallery.js, newest first
{ image: 'hackathon-win', alt: 'Holding the winners cheque on stage' },
```

That's it — `image` is the filename **without its extension**, and order in the array is order on
the page.

| Field | |
| --- | --- |
| `image` | **required** — filename without extension. Optional *only* on a video-only entry, which draws a placeholder tile instead |
| `tags` | *optional* — which filter group(s) it belongs to, e.g. `['sessions']`. A photo can sit in several: `['sessions', 'wins']` |
| `alt` | **required** — what's in the photo, one short sentence, for screen readers |
| `caption` | *optional* — the story behind it. **Leave it out and the photo just stands on its own.** |
| `date` | *optional* — any format: `'Mar 2024'`, `'2023'`, `'Summer 2022'` |
| `video` | *optional* — a Google Drive share link |

**Adding a video:** put the Drive link in `video`. It loads **only on click** — zero requests to
Google before that. Set the Drive file to *"Anyone with the link can view"* or visitors hit a
permission wall.

Give it an `image` only if that still is from the **same event** — a poster borrowed from a
different talk mislabels both. With no `image`, the tile draws a placeholder with a play button and
the `alt` text, and opens straight into the player.

```js
{
  image: 'ajax-talk',
  alt: 'Presenting a slide titled "The Evolution of Ajax"',
  caption: 'Talking through how Ajax changed the web.',
  date: 'Mar 2024',
  video: 'https://drive.google.com/file/d/FILE_ID/view',
}
```

To remove a photo, delete its entry. The file in `src/assets/gallery/` can stay — unreferenced
images are never bundled.

#### Filter groups

Above the photos is a row of chips — **All · Sessions · Wins · Casual** — each with a count. Give a
photo its group with `tags`:

```js
{ image: 'techinniza-trophy', alt: '…', tags: ['wins'] },
{ image: 'ajax-talk',         alt: '…', tags: ['sessions'] },
{ image: 'demo-day',          alt: '…', tags: ['sessions', 'wins'] },  // can be in both
```

The chips themselves live in **`galleryTags`** at the top of `src/data/gallery.js`:

```js
export const galleryTags = [
  { id: 'sessions', label: 'Sessions' },
  { id: 'wins', label: 'Wins' },
  { id: 'casual', label: 'Casual' },
]
```

| To… | Do this |
| --- | --- |
| **Rename** a group | change its `label` — the `id` in the photos stays the same |
| **Reorder** the chips | move the line; order here is order on screen |
| **Add** a group | add a line, then put its `id` in a photo's `tags` |
| **Delete** a group | remove the line and drop that `id` from any photo |

Three things make this forgiving:

- A chip **only appears if at least one photo carries it**, so deleting the last photo of a group
  removes its chip automatically.
- A tag used by a photo but **missing from `galleryTags` still works** — it shows up labelled from
  its id. You can tag first and tidy the labels later.
- The whole row is **hidden unless there are two or more groups**, and **"All" is always there**
  without needing an entry.

Untagged photos appear only under "All". Opening a photo while a filter is active pages through
*that group* — the counter reads "1 / 5" in Wins, not "1 / 16".

### The Projects page

One array in `projects.js`. **Order in the file is the order on the page.**

```js
{
  title: 'Event Report Generator',
  blurb: 'One or two sentences. What it does and why it mattered.',
  image: 'event-report-generator',   // base name — see below
  link: 'https://…',                 // the live site — or '/learn' for a page on this site
  tags: ['React', 'Node.js', 'Python'],
  featured: true,                    // also show it on the home page
}
```

- **Add** — append an object. **Remove** — delete it. **Reorder** — move it.
- `featured: true` also surfaces it in "Selected work" on the home page. That row shows three across
  on desktop, so feature **three** (or six). With an odd number, the first one spans the full row on
  tablets so nothing is left stranded. Omit `featured` for the rest.
- `link` starting with `/` is a page on this site (the Documentation Engine card uses `/learn`) and
  opens in place. Anything else opens in a new tab.
- `earlier: true` moves a project out of the card grid into a compact **Earlier projects** list
  below it: title, one line, tags, no image. Remove the flag to promote it back to a card.
- `tags` are free text; they're labels, not filters.

**Adding a project image** is the one step with a command attached:

```bash
# 1. drop the screenshot into src/assets/projectImages/  e.g. my-new-app.png
npm run images
# 2. reference it by base name, without the extension:  image: 'my-new-app'
```

`npm run images` generates AVIF, WebP and JPEG at 400, 800 and 1200px (1200 is only requested by the lead card, which spans the full row on tablets). If you reference an image you
haven't generated, the card renders without one and the dev console tells you which command to run
— it won't fail the build.

### Page headings

`pages.js` holds the heading and intro line at the top of About, Projects and Learn:

```js
projects: {
  eyebrow: 'Projects',
  title: "Things I've built",
  lead: 'Each one is live, and each one taught me something I now use elsewhere.',
}
```

`lead` is optional — omit it and the page renders just the title. About deliberately has no `title`
because it uses your name from `profile.js`. Subject pages inside Learn take their heading from
that subject's `series.json` instead.

---

## How it's built

```
content/                        ← YOU EDIT THIS
  javascript/
    series.json                 title, blurb, order, accent, tag vocabulary
    01_Execution_Context…html
    …
  system-design/
    series.json
    01_Load_Balancing.html
```

```
content/<subject>/*.html  →  scripts/build-notes.mjs   →  src/content/<subject>/notes/<slug>.json
                                                       →  src/content/<subject>/index.json
                                                       →  src/content/subjects.json
                          →  scripts/build-search.mjs  →  src/content/search.json
```

The parser is plain Node with **zero npm dependencies** — a hand-rolled HTML tokenizer, ~1,300
lines, importing only `node:fs`, `node:path` and `node:url`. The site reads only the generated
JSON, so chapters are themeable, searchable, and load one chunk per chapter.

**Performance** (measured on the production build): **208 KB** transferred, **9 requests**, first
contentful paint **52 ms**, build **~0.2 s**, **10 dependencies**, **0 vulnerabilities**. Images
are AVIF/WebP/JPEG at the sizes actually rendered. Motion is CSS-only and honours
`prefers-reduced-motion`.

**Theming**: both themes are CSS custom properties on `<html>[data-theme]`, resolved before first
paint by a small inline script in `index.html` so there's no flash. The choice is remembered and
follows the OS until the visitor overrides it.

The full picture (parser internals, search ranking, image crops, social tags, accessibility,
before/after numbers and the reasons behind each choice) is in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Deploying

It's a static site: the host runs `npm run build` and serves the `dist/` folder. Any of these
works with no extra config:

| Host | Settings |
| --- | --- |
| **Vercel** (in use) | Nothing to set. `vercel.json` pins the Vite preset, `npm run build` and the `dist` output, overriding the dashboard. That matters because the project was created for v1's Create React App build. It also handles routing. |
| **Netlify** | Build command `npm run build`, publish directory `dist`. `public/_redirects` already handles routing. |
| **Cloudflare Pages** | Build command `npm run build`, output `dist`. `public/_redirects` handles routing. **Set `SITE_URL`** (see below). |

Node **20.19 or newer**, declared in `package.json` (`engines`). Vercel follows it.

**Routing.** This is a single-page app: there's one real HTML file, and the router decides what to
show. The rewrite files tell the host to serve `index.html` for every path. Without them, opening a
chapter link directly or refreshing it gives the host's 404.

**The site's address (`SITE_URL`).** Link previews on LinkedIn, X, Slack and WhatsApp need the
site's full address to find `og.png`. You don't write it anywhere: the build reads it from the
host. On Vercel and Netlify that's automatic.

- **Using a custom domain?** Set an environment variable `SITE_URL=https://your-domain.com` in the
  host's project settings.
- **On Cloudflare Pages, always set `SITE_URL`.** Its built-in variable is the address of each
  individual deployment, which changes every build.
- With no address available (a local build, for example), the build **removes** the preview-image
  tags rather than shipping broken ones. That's expected.

**After deploying:** paste the URL into a LinkedIn or Slack message to check the preview card, and
open a chapter URL directly in a fresh tab to check routing.

## Publishing

Vercel deploys `main` to https://portfolio-parthgupta.vercel.app/ on every push, so **pushing
`main` is publishing**. The address never changes, and every v1 address (`/`, `/projects`, `/about`)
still works.

**Signing in.** The remote names the account (`https://parthgupta49@github.com/…`), so the first
push asks for a password for `parthgupta49`. GitHub doesn't accept account passwords there; use a
**personal access token**: GitHub → Settings → Developer settings → Personal access tokens →
*Fine-grained*, limited to the `MyPortFolio` repository with **Contents: Read and write**. macOS
saves it in the keychain for later pushes. On a shared or work computer, delete it from Keychain
Access (search "github.com", the entry for `parthgupta49`) when you're done.

1. Run the [Before you publish](#before-you-publish) checks.
2. *First v2 deploy, recommended:* push the same commit to a preview branch first. Vercel builds
   every branch at its own preview address, so you can check the real deployment before it
   replaces the live site:

   ```bash
   git push origin main:v2-preview
   ```

   Open that deployment from the Vercel dashboard (or the ✓ next to the commit on GitHub), click
   through it, then remove the branch with `git push origin --delete v2-preview`.
3. Publish:

   ```bash
   git push origin main
   ```

4. Push the version tags, so v1 and v2 are marked on GitHub too:

   ```bash
   git push origin v1 v2
   ```

**Never push `revamp`.** It holds the step-by-step development history and stays local on purpose.
If a deploy goes wrong, Vercel's dashboard can promote the previous production deployment back in
one click (*Instant Rollback*).

## Sharing a copy

Zip the folder **without** `node_modules` and `dist`. Both are rebuilt from scratch, and
`node_modules` alone is far bigger than the project. Run this from the folder that *contains*
`MyPortFolio`:

```bash
zip -r "MyPortFolio.zip" MyPortFolio -x "*/node_modules/*" "*/dist/*" "*/.git/*" "*/.DS_Store" "*/content/.blocklist" "MyPortFolio/*.pdf"
```

That leaves out `.git` on purpose, because it holds the private `revamp` history. It also leaves out
the local `content/.blocklist` and any personal PDFs. The recipient needs Node 20.19+ and runs
`npm install`, then `npm run dev`.

## Before you publish

A quick pass before any deploy:

1. `npm run build` succeeds, and the parser output ends with `guard: clean`. Check the code column
   too: emitted and source counts should be equal, e.g. `51/51`.
2. `npm run preview`, then click through: Home → Learn → a subject → a chapter (open an answer,
   follow a search result's section link) → Projects → About (open and close a gallery photo).
3. Check it in **both themes** and at **phone width**.
4. Look for anything that reads as machine-made: raw `&amp;`, code-like words in visible text,
   empty slots, placeholder text. Treat any of these as a blocker.
5. Check the résumé link and the project links still open the right thing.

## Code style

- **Formatting:** Prettier with `--no-semi --single-quote --print-width 100`. There's no config
  file, so pass the flags:
  `npx prettier --write --no-semi --single-quote --print-width 100 <files>`.
  **Exception:** `scripts/build-notes.mjs` uses semicolons. Leave it that way and don't reformat it
  wholesale.
- **Comments explain *why*,** not what. The code here comments its reasons (why a crop strategy,
  why not fuzzy search). Keep that up when you change things.
- **Data files document their own fields** in a comment at the top. Update it when you add a field.
- **Commit messages** have a short subject line and a body that says why. The history is part of
  the documentation.

---

## Gotchas

- **`src/content/` is generated and wiped on every `npm run docs`.** Never hand-edit it. Edit the
  HTML in `content/` and re-run.
- **`content/` is the source of truth.** If you keep a copy of the docs anywhere else, the two will
  drift.
- **Videos belong in `src/data/videos.js`, not in the content JSON** — anything set in the generated
  JSON is lost on the next run.
- **Old `/learn/<chapter>` links** from before subjects existed redirect to
  `/learn/<subject>/<chapter>` rather than 404ing.
- **`npm run build` runs `npm run docs` first**, so a deploy can never ship stale content.
- The build **fails loudly** if a sanitization rule is violated — see the rule table at the top of
  `scripts/build-notes.mjs`.
- **Running `npm run docs` (or `build`) while `npm run dev` is running** briefly logs
  `Failed to resolve import "../content/search.json"`, because the parser wipes `src/content/` before
  rewriting it. It fixes itself on the next reload; nothing is broken.
- **Code highlighting only understands JavaScript.** Before publishing a subject with Python, SQL or
  shell samples, extend `src/lib/highlight.js`. See [docs/ROADMAP.md](docs/ROADMAP.md).
