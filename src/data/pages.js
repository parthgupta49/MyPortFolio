/* The headings at the top of each page.
 *
 * These used to live inside the page components, which meant changing a single
 * sentence required hunting through JSX. Everything you'd want to reword now
 * sits in src/data/ — this file for the headings, profile.js and projects.js
 * for the content beneath them.
 *
 * `lead` is optional; leave it out and the page just renders the title. */

export const pages = {
  about: {
    eyebrow: 'About',
    // `title` is omitted on purpose — About uses your name from profile.js.
    lead: 'A developer who would rather know why something works than memorize that it does.',
  },

  projects: {
    eyebrow: 'Projects',
    title: "Things I've built",
    lead: 'Each one is live, and each one taught me something I now use elsewhere.',
  },

  learn: {
    eyebrow: 'Learn',
    title: 'Technical documentation',
    lead: 'In-depth documentation written while learning each topic properly — the reference I wanted to exist when I started.',
  },
}
