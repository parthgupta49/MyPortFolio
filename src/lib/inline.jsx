import { Fragment, createElement } from 'react'
import { decodeEntities } from './entities.js'

/* The parser sanitizes every "html" field down to five inline tags. Rather
 * than hand that to dangerouslySetInnerHTML, we parse the subset into React
 * elements. Costs a few hundred bytes, removes the injection class entirely,
 * and lets us force rel="noreferrer" on every outbound link.
 *
 * Anything unrecognised is rendered as literal text, never as markup. */

const ALLOWED = new Set(['code', 'strong', 'em', 'b', 'i', 'br', 'a'])
const TAG = /<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z-]+="[^"]*")*)\s*(\/?)>/g

const CODE_CLASS =
  'rounded-[5px] border border-line bg-surface-2 px-[0.35em] py-[0.12em] text-[0.88em] text-accent-text'

function attrs(raw) {
  const out = {}
  for (const m of raw.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) out[m[1]] = decodeEntities(m[2])
  return out
}

function element(tag, props, children, key) {
  switch (tag) {
    case 'code':
      return (
        <code key={key} className={CODE_CLASS}>
          {children}
        </code>
      )
    case 'strong':
    case 'b':
      return (
        <strong key={key} className="font-semibold text-ink">
          {children}
        </strong>
      )
    case 'em':
    case 'i':
      return <em key={key}>{children}</em>
    case 'br':
      return <br key={key} />
    case 'a': {
      const href = props.href ?? '#'
      const external = /^https?:/i.test(href)
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="text-accent underline decoration-accent/35 underline-offset-2 transition-colors hover:decoration-accent"
        >
          {children}
        </a>
      )
    }
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

/** Render a sanitized inline-HTML string as React nodes. */
export function Inline({ html }) {
  if (!html) return null

  // Each stack frame collects the children of one open tag.
  const stack = [{ tag: null, props: {}, children: [] }]
  let last = 0
  let key = 0
  let m

  // React renders a string verbatim, so an entity left encoded here reaches the
  // reader as the literal characters "&amp;". Decode at the boundary where
  // markup becomes words.
  const pushText = (text) => {
    if (text) stack.at(-1).children.push(decodeEntities(text))
  }

  TAG.lastIndex = 0
  while ((m = TAG.exec(html)) !== null) {
    const [full, closing, rawTag, rawAttrs, selfClose] = m
    const tag = rawTag.toLowerCase()

    // Unknown tag: emit it as visible text rather than interpreting it.
    if (!ALLOWED.has(tag)) continue

    pushText(html.slice(last, m.index))
    last = m.index + full.length

    if (tag === 'br' || selfClose) {
      stack.at(-1).children.push(<br key={key++} />)
      continue
    }

    if (closing) {
      if (stack.length > 1) {
        const frame = stack.pop()
        stack.at(-1).children.push(element(frame.tag, frame.props, frame.children, key++))
      }
    } else {
      stack.push({ tag, props: attrs(rawAttrs), children: [] })
    }
  }

  pushText(html.slice(last))

  // Unbalanced markup: close whatever is still open so nothing is dropped.
  while (stack.length > 1) {
    const frame = stack.pop()
    stack.at(-1).children.push(element(frame.tag, frame.props, frame.children, key++))
  }

  return createElement(Fragment, null, ...stack[0].children)
}
