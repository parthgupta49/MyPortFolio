/* Everything about the person, in one file. Edit here, not in components. */

export const profile = {
  name: 'Parth Gupta',
  first: 'Parth',
  // The small label above your name on Home: your role and where, said once.
  headline: 'JavaScript Developer at LTM',
  // Rotates after "I build" on Home. What you make rather than job titles, so
  // the hero doesn't repeat the headline. Keep exactly three: the animation
  // timing (.rotator in src/index.css) is built for three.
  builds: ['integration pipelines', 'full-stack web apps', 'AI-powered tools'],
  tagline:
    'Day to day, I work on the integration and automation systems that keep real data moving between platforms. I also write and publish detailed technical documentation on the JavaScript engine and the event loop.',
  // Google Drive share link. Keep the file set to "Anyone with the link can view".
  resume: 'https://drive.google.com/file/d/1K-MTgvENUpQTV1GR4bXRly0kSFnVm2d-/view?usp=sharing',
  email: 'nbparthgupta4959@gmail.com',
}

export const socials = [
  { label: 'GitHub', href: 'https://github.com/parthgupta49', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/parthgupta49/', icon: 'linkedin' },
  { label: 'Twitter', href: 'https://twitter.com/parthgupta49', icon: 'twitter' },
  { label: 'Medium', href: 'https://medium.com/@ParthGupta49', icon: 'medium' },
  { label: 'LeetCode', href: 'https://leetcode.com/Parthgupta49/', icon: 'leetcode' },
]

/* The strip under the hero — a visual highlight, not the full skill list.
   The complete breakdown lives in `skills` below and renders on About. */
export const stack = [
  { label: 'JavaScript', icon: 'javascript' },
  { label: 'React', icon: 'react' },
  { label: 'Node.js', icon: 'node' },
  { label: 'Python', icon: 'python' },
  { label: 'MongoDB', icon: 'mongodb' },
  { label: 'AWS', icon: 'aws' },
]

export const experience = [
  {
    company: 'LTM',
    role: 'JavaScript Developer',
    from: 'Jun 2025',
    to: 'Present',
    current: true,
    summary:
      'Integration and automation work across SaaS platforms — moving data between systems reliably, and making the slow parts fast.',
    points: [
      'Batch jobs that used to take hours now finish in under ten minutes — chunking and pagination over 15K+ record updates.',
      'Wrote the automation scripts the team runs daily: 10K+ records a pass, and about eight hours a week of manual data entry gone.',
      'Mapped external schemas onto our internal models across 5K+ daily transactions, which mostly meant handling what goes wrong — retries, partial writes, orphaned records.',
      'REST integrations with three SaaS platforms, holding ~99% success once auth, pagination and retry behaviour were pinned down.',
      'Halved our mean time to resolution on routing bugs by adding proper logging, rather than by reading JSON in Postman one payload at a time.',
      'Put source-to-downstream reconciliation on a schedule so nobody has to remember to check it.',
    ],
  },
  {
    company: 'Christ (Deemed to be University), Bangalore',
    role: 'AI Full-Stack Developer',
    from: 'Dec 2024',
    to: 'Apr 2025',
    summary:
      'Accessible Learning Platform — an AI ed-tech platform letting visually impaired students ask questions of PDFs, MP3s and MP4s entirely by voice.',
    points: [
      'Built a retrieval-augmented generation pipeline over documents with LangChain, Llama 3 on Groq, and FAISS.',
      'Used Google Gemini multimodally to pull insight out of PDFs, images and audio/video.',
      'Made the whole platform hands-free with the Web Speech API — voice navigation, spoken queries, spoken answers.',
      'Fetched relevant YouTube material on demand and summarised it with Gemini.',
      'Secured faculty and admin dashboards with JWT-based role access control.',
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'Python', 'LangChain', 'Groq (Llama 3)', 'Google Gemini'],
  },
]

/* Same shape as `experience`, so it renders on the same timeline. Newest first;
   `current: true` gives an entry the accent dot. */
export const education = [
  {
    school: 'Christ (Deemed to be University), Bangalore',
    qualification: 'Bachelor of Computer Applications',
    from: '2022',
    to: '2025',
    result: 'CGPA 9.26 / 10',
  },
  {
    school: "A A M Children's Academy",
    qualification: 'Class XII, CBSE',
    from: '2021',
    to: '2022',
    result: '94.17%',
  },
  {
    school: "A A M Children's Academy",
    qualification: 'Class X, CBSE',
    from: '2019',
    to: '2020',
    result: '91.50%',
  },
]

export const skills = [
  {
    group: 'Web',
    items: ['JavaScript (ES5/ES6)', 'React', 'Redux', 'Context API', 'Node.js', 'HTML', 'CSS'],
  },
  { group: 'AI', items: ['RAG', 'LangChain', 'HuggingFace', 'Machine Learning'] },
  { group: 'Data', items: ['MongoDB', 'MySQL (basics)'] },
  { group: 'Frameworks', items: ['Express.js', 'Tailwind CSS'] },
  { group: 'Platforms', items: ['AWS', 'Ubuntu', 'GitHub'] },
  { group: 'Tools', items: ['Git', 'Postman'] },
  { group: 'Languages', items: ['JavaScript', 'Python', 'Java', 'C'] },
]

/* RECOGNITION
 *
 * Each entry renders the same way as a certification: a title, a muted detail
 * line, and optionally a result pill and a link to the evidence. Newest first.
 *
 *   'Best Trainee'                     a plain string is a title on its own
 *   {
 *     title:     'Meritorious Scholarship',  required
 *     detail:    'CHRIST · 2023–24',         optional  who, when, what for
 *     result:    'GPA 3.97 / 4',             optional  the accent pill — keep it
 *                                                      to a number or grade, like
 *                                                      the education results
 *     link:      'https://…',                optional  adds "View certificate ↗"
 *     linkLabel: 'Read the post',            optional  other wording for that link
 *   }
 *
 * The styling lives in one place: `Credential` in src/pages/About.jsx. */
export const awards = [
  {
    title: 'Certificate of Excellence',
    detail: 'LTM · ServiceNow workflows in JavaScript',
    link: 'https://drive.google.com/file/d/18wFVZK50WoCIJuD5ZyzpZWwyaM6tOxO5/view',
  },
  { title: 'Best Trainee', detail: 'LTM' },
  {
    title: 'Meritorious Scholarship',
    detail: 'CHRIST · 2023–24',
    result: 'GPA 3.97 / 4',
    link: 'https://drive.google.com/file/d/1jjrwRyTrqVC9IYdWCv1aT4c8QY18bv8K/view',
  },
]

/* CERTIFICATIONS
 *
 * The whole section is hidden while this array is empty — add one entry and it
 * appears. `name` is the only required field.
 *
 *   name     required   what it's called
 *   issuer   optional   who issued it
 *   date     optional   'Mar 2024', '2024', anything
 *   id       optional   credential / licence number
 *   link     optional   where it can be verified — adds "Show credential ↗"
 */
export const certifications = [
  {
    name: 'AWS Academy Cloud Foundations',
    issuer: 'AWS Academy',
    id: '82078',
    // link: 'https://…',   ← add the verification URL when you have it
  },
]

/* The About page reads as prose, not as a typing animation that makes
   the visitor wait to read a paragraph. */
export const about = [
  {
    heading: 'Now',
    body: "I'm a JavaScript Developer at LTM. My job is moving data between systems without losing any of it — integration flows, batch jobs, reconciliation. Unglamorous work that quietly gives a team back whole days each month when it's right, and costs someone a weekend when it isn't.",
  },
  {
    heading: 'Before that',
    body: 'I built an AI accessible-learning platform at Christ University that let visually impaired students ask questions of PDFs, audio and video entirely by voice — a RAG pipeline over their own course material, with the whole interface driven by speech.',
  },
  {
    heading: 'Why I document this',
    body: "Debugging integrations taught me that most confusing bugs live one layer below the framework — in the event loop, in what a reference actually points at, in when a closure captures. So I went and learned that layer properly, and documented it. It's all published here under Learn.",
  },
]
