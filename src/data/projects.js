/* The Projects page, and "Selected work" on Home. Order here is order on the page.
 *
 *   title     required
 *   blurb     required   one or two sentences: what it does and why it mattered
 *   image     required   base name of the screenshot in src/assets/optimized/ —
 *                        drop the PNG in src/assets/projectImages/, run `npm run images`.
 *                        Not needed for an `earlier` project, which shows no image
 *   link      required   the live site. A path starting with "/" opens a page on
 *                        this site, in the same tab
 *   tags      required   free-text labels, not filters
 *   featured  optional   also show it in "Selected work" on Home. Feature three.
 *   earlier   optional   list it compactly under "Earlier projects", below the cards.
 *                        Its image isn't shown there; remove the flag to promote it back.
 */

export const projects = [
  {
    title: 'Custom Documentation Engine',
    blurb:
      'A portfolio and knowledge platform built to publish long-form technical content without a CMS. Authored HTML is compiled into structured JSON, enabling generated metadata, chapter navigation, search indexing, and an accessible reading experience.',
    image: 'documentation-engine',
    // A path on this site, so the card opens Learn in place rather than in a new tab.
    link: '/learn',
    tags: ['React', 'Node.js', 'Content Pipeline', 'Search', 'Documentation'],
    featured: true,
  },
  {
    title: 'Event Report Generator',
    blurb:
      'Cuts 6+ hours of manual write-up per event at Christ University. A dynamic form in, an AI-summarised report and newsletter out — as PDF or DOCX, emailed straight to recipients.',
    image: 'event-report-generator',
    link: 'https://csbyc-event-report-generator.vercel.app/',
    tags: ['React', 'Node.js', 'Python', 'Automation'],
    featured: true,
  },
  {
    title: 'Animated MERN App',
    blurb: 'A motion-heavy MERN application with full authentication. Best viewed on desktop.',
    image: 'badakar-website',
    link: 'https://badakar-assignment-app.vercel.app/',
    tags: ['MERN', 'Auth', 'Animation'],
    featured: true,
  },
  {
    title: 'Portfolio v1',
    earlier: true,
    blurb:
      'The first version of this site, built with Create React App and Framer Motion. Rebuilding it as v2 cut the first load from 3.2 MB to 206 KB.',
    // v1's last commit on GitHub — the code, not a live site.
    link: 'https://github.com/parthgupta49/MyPortFolio/tree/5151d9a090823ed5b86e4d8c5bd96cb874ef7cdf',
    tags: ['React', 'Framer Motion', 'Tailwind CSS'],
  },
  {
    title: 'Weather App',
    earlier: true,
    blurb: 'Live conditions for any city, pulled from the OpenWeatherMap API.',
    image: 'weather-app',
    link: 'https://weather-app-parthgupta.vercel.app/',
    tags: ['JavaScript', 'REST API'],
  },
  {
    title: 'Password Generator',
    earlier: true,
    blurb: 'Generates strong random passwords to your chosen length and character rules.',
    image: 'password-genertor',
    link: 'https://password-generator-parthgupta.vercel.app/',
    tags: ['JavaScript', 'React'],
  },
  {
    title: 'Tic-Tac-Toe',
    earlier: true,
    blurb: 'Two-player tic-tac-toe with win detection and a reset flow.',
    image: 'tic-tac-toe',
    link: 'https://tictactoe-parthgupta.netlify.app/',
    tags: ['JavaScript', 'Game'],
  },
]
