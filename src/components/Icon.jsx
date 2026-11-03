/* Named imports from react-icons/* are tree-shaken by Rollup, so only these
   marks ship — not the icon packs they come from. */
import {
  FaGithub,
  FaLinkedinIn,
  FaJava,
  FaNodeJs,
  FaXTwitter,
  FaMedium,
  FaAws,
  FaPython,
} from 'react-icons/fa6'
import { SiLeetcode, SiMongodb, SiTailwindcss, SiJavascript, SiReact } from 'react-icons/si'

const ICONS = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  medium: FaMedium,
  leetcode: SiLeetcode,
  javascript: SiJavascript,
  react: SiReact,
  node: FaNodeJs,
  mongodb: SiMongodb,
  tailwind: SiTailwindcss,
  java: FaJava,
  python: FaPython,
  aws: FaAws,
}

export default function Icon({ name, className = '' }) {
  const C = ICONS[name]
  if (!C) return null
  return <C className={className} aria-hidden="true" focusable="false" />
}
