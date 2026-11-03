# Decisions

What I decided, **why**, and what I tried and rejected, so I don't undo a deliberate choice by
accident later. Days in order; within a day, roughly in the order things happened.

**v1** is the original Create React App site (git tag `v1`). **v2** is this rebuild.

---

## Ground rules

These apply to every change, not just the one that introduced them.

| Rule | Why |
| --- | --- |
| **`main` is production.** Every push to `main` deploys to Vercel. | Nothing reaches `main` without being built and checked locally first (README → *Before you publish*). |
| **Blocklisted terms never reach the site.** | Enforced at build time by a guard that fails the build. The terms live in a local, gitignored file; see [ARCHITECTURE.md](ARCHITECTURE.md#blocklist-guard). |
| **It's "documentation" or "docs", never "notes",** in anything a visitor reads. | "Notes" undersold the work. Internal names (`build-notes.mjs`, `note-box`, `notes/` folders) stay, because renaming them is churn nobody sees. |
| **Learn sits to the left of Projects** in the nav, with a quiet accent. | Learn is the core of the site (see [PLAN.md](PLAN.md)). |
| **Learn is reference documentation, not tutorials.** Searchable, tag-filtered, with sub-sections, and an optional video per chapter. | That's what I want to be able to come back to. |
| **Nothing on the page may look careless**: no raw HTML entities, code identifiers, broken characters, glued-together punctuation, or empty placeholders. | One visible `&amp;` makes a whole site look unfinished. Any of these is a release blocker. |
| **No guessed facts**: no made-up domains, dates, numbers or claims. | A guessed domain once ended up in the social tags (see 2026-10-29). |
| **Check what a visitor actually experiences.** Real clicks, both themes, phone and desktop widths, at full resolution. | A scripted `.click()` once "passed" a lightbox that a real click couldn't close, and a design once looked fine in a scaled-down screenshot but not at real size. |
| **Everything is documented in the repo**: README for how-to, `docs/` for how it works and why. | Understanding this project shouldn't depend on remembering anything that isn't written here. |

---

## 2026-09-20: The rebuild

**Rebuilt on Vite + React 19 + Tailwind 4, replacing Create React App.**
CRA is deprecated. v1 installed 1,854 packages with 81 known vulnerabilities and sent 3,245 KB on
first load. v2 has 47 packages, 0 vulnerabilities, 206 KB. Removed: framer-motion, react-spring,
react-typed, react-type-animation, grapheme-splitter, @uidotdev/usehooks. Animations became CSS.
*Rejected:* upgrading CRA in place, since it's no longer maintained.

**Added Learn, generated from my existing HTML chapters** rather than rewriting them in Markdown or
adopting a docs framework. The reasoning is in
[ARCHITECTURE.md § 13](ARCHITECTURE.md#13-why-its-built-this-way).

**The Answer Key is real collapsibles, with question ↔ answer links.**
The first version showed the literal string "Q1" as each answer, because the parser's `answer`
block is a *marker* and the renderer treated it as content. Now each answer is collapsed, labelled
with its question, opens on click or deep link, and links back. Links are generated from question
numbers, so they can't go out of sync.

**The chapter Contents rail sits on the left.** You read the outline first, then the content.

**Hero: left-aligned text with the portrait on the right.**
*Tried and rejected:* a centred, stacked hero. The left-aligned layout looks more professional.
What actually looked wrong, the portrait sitting off-centre, was the **image crop**, not the
layout: sharp's `attention` strategy cropped unevenly. Portraits now use a centre crop.

**Search results' section hints are real links** that jump to the section. Showing a matching
heading you can't click has no purpose.

**Learn is multi-subject and self-serve.** Adding a chapter or a whole subject must never need a
code change: subjects are folders under `content/`, each with its own `series.json` and tag
vocabulary, and `npm run new` scaffolds both. The first version hardcoded the source path, the
series name and a JavaScript-only tag list.

**All page text lives in `src/data/`**, so rewording never means opening a component. The README
is the full operating guide.

---

## 2026-09-27: Wording, About page, Gallery

**"Notes" → "documentation / docs" everywhere visitors look.** "Read the notes" became "Read the
docs", the Learn title became "Technical documentation", and `npm run notes` became `npm run docs`.

**The wordmark dot pulses continuously**: a soft fade, not a hard blink, which reads as a rendering
fault. **The theme toggle shows a pointer cursor.**

**A Gallery on the About page**: photos, Google Drive videos, and optional context per item.
Captions are optional by design; not every photo needs a story.

**Education is a timeline, like Experience, placed below Skills.** Higher up, it looked too big.

**Hacktoberfest removed from Recognition.**

**Gallery tiles are a uniform 4:3 grid; the full-screen view shows the whole photo.**
*Tried and rejected:* natural-size masonry. Consistent sizing reads tidier.

**The lightbox renders through a portal onto `<body>`.** `<main>` has a z-index (for the background
grain layer), which traps any overlay inside it under the sticky header, so an opened photo
couldn't be closed. A scripted test had passed because `.click()` skips hit-testing; it was
re-checked with real coordinates.

**A photo and a video are paired only if they're the same event.** The Ajax class-presentation
photo and the LTM Git-fundamentals video had been combined by mistake. They're separate entries
now, and `image` is optional on a video-only entry, which shows a placeholder tile.

---

## 2026-10-29: Recognition, certifications, the quality pass

**A Certifications section that hides itself while empty**, and **Gallery filter groups** (All ·
Sessions · Wins · Casual) that are easy to rename, reorder, add or delete. AWS Academy Cloud
Foundations moved from Recognition into Certifications.

**HTML entities are decoded at render time.** "Event Loop `&amp;` Callback Queue" was reaching the
page literally. The fix and its reasoning are in [ARCHITECTURE.md](ARCHITECTURE.md#html-entities).

**A full quality pass, all findings fixed.** Five independent review passes over the whole site
found 22 candidate issues; 18 were real and 4 weren't. Among the 18: glued punctuation
(`fetch's .then` shipped as `fetch's.then`), internal badge names ("star", "warn") showing as
tooltips, and 8 cross-references in the prose pointing at the wrong chapter number. A sweep of
every route afterwards found zero raw entities, broken characters or glued punctuation.

**The cash-prize line removed from Recognition.**

**No hardcoded domain. The site's address is resolved at build time.** A guessed domain had ended
up in the social tags. `index.html` now carries `%SITE_URL%`, filled in from the hosting platform's
own variables or from a `SITE_URL` I set, and those tags are removed when no address is known.
Details in [ARCHITECTURE.md § 10](ARCHITECTURE.md#10-social-previews-seo-and-hosting).

---

## 2026-11-04: Positioning and polish

From my plan in [PLAN.md](PLAN.md).

**The site is positioned as portfolio + knowledge platform, and Learn is the core product.**

**New featured project: Custom Documentation Engine.**
- Title, description and tags (React, Node.js, Content Pipeline, Search, Documentation) as written
  in the plan.
- The card image is a **chapter page** screenshot, not the home page: it signals "documentation
  platform", which is the differentiator.
- It's **first** in `projects.js`, so it leads both Selected work and the Projects page.
- The card links to **`/learn`** and opens in the same tab, because the live application for this
  project *is* Learn. `ProjectCard` treats any `link` starting with `/` as an internal route;
  external links still open in a new tab.

**Selected work shows three across on desktop**, matching the Projects page. On tablets, where
there are two columns, an odd number of featured projects makes the first card span the full row
so none is left alone.

**Learn gets subtle emphasis in the nav**: accent colour and medium weight, on every page and in
both themes, plus medium weight in the phone menu. No badge, no size change. It's an
`emphasis: true` flag on the link rather than a check for `label === "Learn"`, so renaming the
label can't silently break it.

**The hero button stays "Read the docs →".**

**Small text passes contrast in both themes.** `--text-faint` went from `#69717f` to `#7c8492`
(dark) and from `#858c98` to `#69707c` (light), so labels, dates and card tags are ≥ 4.6:1 on every
surface instead of 3.2–4.05:1. They still read as lighter than body text.

**Every page has its own tab title**, through one shared `usePageTitle()` hook, which also replaced
two separate copies of the same logic.

**Headings never skip a level.** Project card titles are `h2` on the Projects page and `h3` under
"Selected work" on Home.

**The lead card loads a sharper image on tablets.** It spans the full row there, so it gets a
1200 px variant. Every other card, and phones, still get the 400/800 px versions.

**The hero says each thing once.**
*Before:* label "JavaScript Developer"; "I build as a [JavaScript Developer · Full-Stack Developer ·
AI Full-Stack Developer]"; tagline "JavaScript Developer at LTM, building the integration…". That's
"JavaScript Developer" three times on the first screen, plus "as a AI…" in the third phrase.
*After:* label "JavaScript Developer at LTM"; "I build [integration pipelines · full-stack web apps
· AI-powered tools]"; tagline "Day to day, I work on the integration and automation systems…". The
rotating phrases describe what I make rather than repeating job titles. Screen readers hear the list
once; the old `aria-label` on a plain span was ignored by most of them. The wording lives in
`profile.js` (`headline`, `builds`, `tagline`).

**Starter projects moved to an "Earlier projects" list.** Weather App, Password Generator and
Tic-Tac-Toe are still live and linked, but shown as compact rows under the three main cards rather
than as full cards next to the Documentation Engine. The flag is `earlier: true` in `projects.js`.

**Kept "Twitter" as the label**, even though the link now redirects to x.com.

**The accessible-learning platform gets no project card yet.** It's arguably the strongest project,
but there's no live link, repo or demo video to point to, and a card that goes nowhere would look
broken. It stays in Experience. Tracked in [ROADMAP.md](ROADMAP.md).

**Recognition: LTM's Certificate of Excellence added, and the scholarship linked to its
certificate.** The detail line reads "LTM · ServiceNow workflows in JavaScript". It names both, and
it's the one phrasing that fits on a single line at every screen size; longer versions wrapped on
laptops and phones. "SNOW" on the certificate is spelled out as ServiceNow so a recruiter recognises
it. No date, because the certificate has none. Both links are public Google Drive files.

**Recognition and Certifications share one layout; evidence links are a separate line.** Every
entry is a title, a muted detail line, an optional result pill, and, if there's evidence, an
accent-coloured "View certificate ↗" (or "Show credential ↗") line. One `Credential` component
renders both lists, so a new entry gets the right look from its data.
- *Tried and rejected the same day:* underlining the linked title and turning a highlighted entry
  into a ringed pill. It looked bad:
  - a three-item list had three different looks (underlined, plain grey, a big blue box);
  - the underline ran under every line of a wrapped title, like ruled paper;
  - a pill built for "94.17%" became a heavy block when wrapped around a whole sentence.
- So **pills only ever hold a number or grade** (the scholarship's pill is just "GPA 3.97 / 4",
  matching the education grades), and **titles are never underlined**: the link is its own line,
  which looks the same whether the title is one line or three.
- Recognition entries are `title` / `detail` / `result` / `link` to fit this layout.
- The link's tap target is 24px tall (the WCAG 2.2 minimum), and its `aria-label` names the entry
  ("View certificate: Meritorious Scholarship (opens in a new tab)"), so several "View certificate"
  links stay distinguishable to screen readers.
- An **unlinked** certification name no longer turns blue on hover, which had suggested a click
  that went nowhere.

**The résumé link points at the current file.**

**Documentation lives in the repo**: [ARCHITECTURE.md](ARCHITECTURE.md), this file,
[ROADMAP.md](ROADMAP.md) and [PLAN.md](PLAN.md), with the README as the entry point.

---

## 2026-11-04 (later): Preparing v2 for publishing

**The original site is kept as v1, in git only.** Its last commit is tagged `v1`, so its code is
always recoverable: `git checkout v1`. It isn't hosted anywhere else: a second public portfolio with
older content would compete with this one in search results.

**v1 is listed under "Earlier projects" as "Portfolio v1"**, linking to its code on GitHub (the
commit tagged `v1`), not to a live copy. *Rejected:* a full project card. It's an older version of
the site the visitor is already on, so a card would send them to outdated content, and it would need
v1 hosted somewhere. The row's point is the before/after: rebuilding cut the first load from 3.2 MB
to 206 KB.

**The address stays https://portfolio-parthgupta.vercel.app/, and no old link breaks.** v2 deploys
into the same Vercel project, so the URL doesn't change. Every address v1 had still works: `/`,
`/projects` and `/about` exist at the same paths (case and trailing slash don't matter, as before),
and every static file v1 served (favicons, the web manifest, `robots.txt`) is at the same path in
v2. Unknown paths get the 404 page with links back in, as they did in v1.

**Pushes go out as `parthgupta49`.** The remote URL names the account
(`https://parthgupta49@github.com/…`), so git asks for that account's credentials and never picks
up another GitHub login saved on the machine.

**v2 went onto `main` as one commit, on top of v1's history.** The step-by-step development history
is kept in a local branch. The public history reads v1 → v2.

**The source chapters themselves are clean,** not just the output. Wording that was previously
rewritten at build time is now written that way in `content/`, and the generated site is
byte-identical before and after. The build guard's terms moved to a local, gitignored
`content/.blocklist`, so the public repo doesn't have to name what it keeps out.

**Vercel builds are pinned in the repo, not the dashboard.** `vercel.json` sets the Vite framework,
`npm run build` and the `dist` output; `package.json` requires Node 20.19+. The Vercel project was
created for v1 (Create React App, `build/` output), and these settings override it, so the first
v2 deploy can't build the old way.

**PDFs dropped into the project root are gitignored.** Certificates and résumés are linked from
hosted copies; the files themselves must never be committed.
