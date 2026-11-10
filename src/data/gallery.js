/* The Gallery at the bottom of the About page.
 *
 * ─── ADDING A PHOTO ──────────────────────────────────────────────────────────
 *   1. Drop the file into  src/assets/gallery/   e.g. hackathon-win.jpg
 *   2. Run                 npm run images
 *   3. Add an entry below, newest first:
 *
 *        { image: 'hackathon-win', alt: 'Holding the winners cheque on stage' },
 *
 *   The `image` value is the FILE NAME WITHOUT ITS EXTENSION. Nothing else to
 *   wire up — order in this array is the order on the page.
 *
 * ─── FIELDS ──────────────────────────────────────────────────────────────────
 *   image    required   file name (no extension) from src/assets/gallery/
 *                       — EXCEPT on a video-only entry, where it may be left
 *                       out and the tile renders a placeholder instead
 *   alt      required   what's in the photo, for screen readers and if it fails
 *                       to load. One short sentence.
 *   caption  OPTIONAL   the story behind it. Leave it out entirely and the
 *                       photo just sits there on its own — perfectly fine.
 *   date     OPTIONAL   any format you like: 'Mar 2024', '2023', 'Summer 2022'
 *   tags     OPTIONAL   which filter group(s) it belongs to, e.g. ['sessions'].
 *                       A photo may sit in several: ['sessions', 'wins'].
 *                       Untagged photos only ever show under "All".
 *   video    OPTIONAL   a Google Drive share link. If the entry also has an
 *                       `image`, that photo becomes the poster; otherwise a
 *                       placeholder tile is drawn. Either way the video loads
 *                       only on click. Set the Drive file to
 *                       "Anyone with the link can view".
 *                       Only pair a photo with a video if they are the SAME
 *                       event — a poster from a different talk is misleading.
 *
 * Thumbnails are a uniform 4:3 crop; the full-screen view always shows the
 * whole, uncropped photo.
 * ────────────────────────────────────────────────────────────────────────────*/

/* The filter row above the photos. Order here is the order of the chips.
 * `id` is what a photo lists in its own `tags`; `label` is what a visitor sees.
 *
 * To RENAME a group, change its `label`. To REORDER, move the line. To ADD one,
 * add a line here and put its `id` in a photo's `tags`. To DELETE one, remove
 * the line and drop that id from any photo.
 *
 * A tag used by a photo but missing here still shows up, labelled from its id —
 * so you can start tagging first and tidy the labels later. A chip only appears
 * if at least one photo carries it, and the whole row is hidden unless there
 * are two or more groups. "All" is always first and needs no entry. */
export const galleryTags = [
  { id: 'sessions', label: 'Sessions' },
  { id: 'wins', label: 'Wins' },
  { id: 'casual', label: 'Casual' },
]

export const gallery = [
  {
    // A video-only entry: no `image`, so the tile renders a placeholder.
    // Swap in a still from the talk whenever you have one.
    video: 'https://drive.google.com/file/d/1HMYju5ohwuln1UMwOLTEhreFpwsH_-5s/view',
    tags: ['sessions'],
    alt: 'Recording of a Git fundamentals walkthrough delivered at LTM',
    caption: 'A walkthrough of Git fundamentals I presented to the team at LTM.',
  },
  {
    image: 'ajax-talk',
    tags: ['sessions'],
    alt: 'Presenting a slide titled "The Evolution of Ajax" to a lecture hall',
    caption:
      'A class presentation on how Ajax changed the web — from full-page reloads to the dynamic applications we take for granted now.',
    date: 'Mar 2024',
  },
  {
    image: 'compiler-talk',
    tags: ['sessions'],
    alt: 'Presenting a diagram of the compilation pipeline',
    caption:
      'Walking a room through what actually happens between source code and an executable: preprocessor, compiler, assembler, linker.',
  },
  {
    image: 'techinniza-trophy',
    tags: ['wins'],
    alt: 'Holding the TechINNiZa intercollegiate rolling trophy',
    caption: 'TechINNiZa intercollegiate — champions.',
  },
  /*
  {
    image: 'techinniza-team',
    tags: ['wins'],
    alt: 'A large team on stage holding a trophy together',
    caption: 'The whole squad, right after the result was announced.',
  },
  */
  {
    image: 'archive-review-writing',
    tags: ['wins'],
    alt: 'A poster listing the ARCHive Research Hub review writing winners',
    caption: 'Named a winner in the ARCHive Research Hub review-writing competition.',
    date: '2024',
  },
  {
    image: 'bitcoin-first-place',
    tags: ['wins'],
    alt: 'Receiving a certificate on stage, a Bitcoin presentation on the screen behind',
    caption: 'collecting intercollegiate competition event prize',
  },
  {
    image: 'graph-theory-class',
    tags: ['sessions'],
    alt: 'A full lecture hall during a Graph Theory class, Huffman coding on the board',
    caption: 'Graph Theory, working through Huffman coding.',
    date: 'Mar 2024',
  },
  {
    image: 'class-whiteboard',
    tags: ['sessions'],
    alt: 'Standing at the whiteboard in front of a class',
    // no caption — see the note at the top of this file
  },
  {
    image: 'graph-theory-room',
    tags: ['sessions'],
    alt: 'The lecture hall from the back rows during a Graph Theory session',
  },
  {
    image: 'class-presenting',
    tags: ['sessions'],
    alt: 'Presenting at the front of a classroom alongside a faculty member',
  },
  /*
  {
    image: 'newspaper-results',
    tags: ['wins'],
    alt: 'A newspaper clipping covering the school CBSE class 12 results',
    caption:
      'The local paper covering our board results — my name is in the list of students who crossed 90%.',
  },
  */
  {
    image: 'portrait-illustration',
    tags: ['casual'],
    alt: 'An art-deco style illustrated portrait',
    caption: 'An illustrated portrait',
  },
  /*
  {
    image: 'venuvan-rajgir',
    tags: ['casual'],
    alt: 'Standing in front of the Venuvan wall in Rajgir',
    caption: 'Venuvan, Rajgir.',
  },
  */
  {
    image: 'campus-day',
    tags: ['casual'],
    alt: 'Standing outside on campus in a navy kurta',
  },
  {
    image: 'rooftop-evening',
    tags: ['casual'],
    alt: 'Sitting with a friend on a rooftop in the evening',
    caption: 'Met Kunal Kushwaha in an event hosted in Bangalore',
  },
]
