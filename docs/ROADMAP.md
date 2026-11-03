# Roadmap

What's done, what's open, and what's next. I update this file when an item moves. My original plan
is in [PLAN.md](PLAN.md) ("V1" there means this site, v2); this file tracks it.

Last updated **2026-11-04**.

---

## The plan's "Do now": status

| Item (from the plan) | Status |
| --- | --- |
| Deploy website | **Ready to push.** v2 is committed on `main` locally, and Vercel deploys `main` automatically. Steps: README → *Publishing*. |
| Publish JavaScript content | **Done.** 11 chapters, 184 sections, 92 practice questions. Public once deployed. |
| Improve project descriptions | **Mostly done.** Documentation Engine card added; the three starter projects moved to a compact "Earlier projects" list. Remaining: a card for the learning platform (open item 3). |
| Add Custom Documentation Engine as a featured project | **Done.** See [DECISIONS.md](DECISIONS.md). |
| Continue documenting architecture while learning it | **Ongoing.** [ARCHITECTURE.md](ARCHITECTURE.md) is the "architecture notes" the plan describes. Sections 6, 7 and 13 answer its learning questions (reader, search, design choices). |

---

## Open items

None of these blocks publishing.

1. **AWS Academy certificate has no verification link.** Add `link:` to its entry in
   `certifications` (`src/data/profile.js`) and a "Show credential ↗" line appears.
2. **The LTM Git-talk gallery tile is a placeholder.** Add a still from that talk to
   `src/assets/gallery/`, run `npm run images`, and set `image:` on that entry. Only a frame from the
   same talk.
3. **A project card for the accessible-learning platform** (Christ University, voice-driven RAG for
   visually impaired students). It's the strongest project but appears only under Experience. It
   needs a screenshot and somewhere to link: a live site, a repo, or a short demo video (a Drive link
   works). Then add it to `projects.js` with `featured: true` and decide which card it replaces in
   "Selected work".
4. **Unused source images.** `src/assets/2241237.JPG` (1.0 MB) and `src/assets/ParthGupta_1.jpg`
   (0.4 MB) aren't referenced anywhere. They're never sent to visitors, but they add 1.5 MB to the
   repo. Keep or delete.
5. **Custom domain (optional).** The address is staying https://portfolio-parthgupta.vercel.app/.
   If I ever add a custom domain, keep the vercel.app address attached too so old links still
   work, and set `SITE_URL` in Vercel's environment variables so canonical and social tags use the
   new one.
6. **Re-measure performance after deploying**, on the real host, and update
   [ARCHITECTURE.md § 12](ARCHITECTURE.md#12-performance) and the README.

**Done:** v1 kept in git only (tag `v1`), and every v1 address still works in v2; résumé link updated; source chapters cleaned and the guard's terms moved to a local
blocklist; docs written for a public repo; personal PDFs out of the project and gitignored; Vercel
build settings pinned in the repo.

---

## Future enhancements: recommended order

My plan's guiding principle is **Publish → Learn → Iterate, not Perfect → Optimize →
Over-engineer**. The order below respects that. Only the first item comes before shipping more
content, and only because it's cheap and protects everything after it.

### 1. Parser and search tests: before the second subject

*Plan said: "Do later". Recommendation: move earlier, but keep it small.*

Every real bug found so far was in the build pipeline: a dropped block type that lost 5 code
samples, `&amp;` reaching the page, `fetch's .then` glued into `fetch's.then`, and answer markers
rendered as content. Each was found by eye. A new subject means HTML the parser has never seen, so
that's when a regression is most likely and least likely to be noticed.

- Use Node's built-in runner (`node --test`). No new dependency.
- **Golden totals:** run the parser and assert today's baseline: 11 chapters, 184 sections, 1,910
  blocks, 579 code samples (495 standalone + 84 in questions), 92 questions, 92 answers, and every
  source `<pre>` emitted exactly once. Any parser change that moves these numbers has to explain
  why.
- **Known regressions as unit cases:** single-pass entity decoding (`&amp;lt;` → `&lt;`), the
  punctuation rule (fixes `word .` but leaves `.then` alone; seven cases were checked by hand during
  that fix but never saved), answer grouping.
- **Search:** AND semantics (adding a term never widens results), ranking order (title beats
  section heading beats summary), and `this` not matching unrelated words.
- Add `"test": "node --test"` to `package.json`, and run it before `vite build` in the build
  script.

About half a day of work.

### 2. Deploy

The plan's top "Do now" item. Nothing technical is blocking it; see open items 4–6 for the
decisions to make first.

### 3. Prerendering and per-page SEO: first thing after deploy

*This is the "later" item with the most long-term value.* The plan's closing point is that the
site gains value with every chapter added, but only if search engines and link previews can see
each chapter. Today every route serves the same HTML shell with the same title and description.

- Add a post-build step that writes `dist/learn/<subject>/<slug>/index.html` for every chapter,
  each with its own `<title>`, description, canonical URL and `og:` tags. The content is already
  JSON at build time, so no framework change is needed.
- Generate `sitemap.xml` from `search.json` in the same step.
- Optional and later: put the rendered chapter content into that HTML too, for full static
  rendering.

### 4. Project case studies: reuse the engine

*Plan: `/projects/:slug` pages with Problem → Requirements → Architecture → Decisions →
Challenges → Trade-offs → Lessons → Improvements (full template in [PLAN.md](PLAN.md)).*

Recommendation: **don't build a second rendering system.** Write each case study as an HTML page,
compile it with the same parser and render it with the same block renderer. The Documentation
Engine's own case study, rendered by the Documentation Engine, is also a good interview story.

What has to change:
- The parser treats every folder under `content/` as a Learn subject. Case studies need their own
  source folder, or a flag in `series.json`, so they don't appear in Learn.
- A `/projects/:slug` route and a "Read the case study" link on cards that have one.

Much of the Documentation Engine case study is already written in
[ARCHITECTURE.md](ARCHITECTURE.md) (sections 5, 7, 13 and 14).

### 5. Analytics

Use a **cookieless** option (Vercel Web Analytics, Cloudflare Web Analytics, or Plausible). They
don't set tracking cookies, so they typically don't need a consent banner. Google Analytics uses
cookies (which usually means a consent banner) and adds a heavy third-party script to a site
whose main selling point is that it's fast. Measure before and after whichever you pick.

### 6. More subjects

The pipeline is ready (`npm run new`). Two prerequisites:
- **The code highlighter only knows JavaScript.** Extend `src/lib/highlight.js` for the new
  language, or switch to a library, before publishing a subject with non-JS samples.
- Write 2–3 chapters, run `npm run docs`, then curate the inferred tag vocabulary (README →
  *How tags work*).

### 7. Learning progress tracking

Mark chapters or sections as read, and resume where you left off. Keep it in **`localStorage`**:
no accounts, no backend, which fits a static site. It's per-browser by nature; say so in the UI.

### 8. Accessibility audit

The basics are in place ([ARCHITECTURE.md § 11](ARCHITECTURE.md#11-accessibility)), and text
contrast was measured and fixed on every route on 2026-11-04. No full check has been done yet. Run axe (browser extension) on every route and do one VoiceOver pass through
a chapter. Worth doing before "accessible reading experience" is claimed in an interview.

### 9. Full-text search (only if needed)

Search reads titles, tags, summaries and section headings, not body text. Add body text only if
real readers miss results. It would multiply the 17 KB index several times over.

### 10. Interactive diagrams: last

High effort per chapter, and it doesn't compound the way more chapters do.
