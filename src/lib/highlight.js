/* A small JavaScript tokenizer for the code samples in the notes.
 *
 * Shiki and Prism are 100KB+ and both support ~200 languages; every sample
 * here is JavaScript. This is ~1KB and handles the cases these notes actually
 * contain. It returns tokens, not HTML, so nothing is ever injected as markup.
 *
 * Order matters: comments and strings are matched first so a // inside a
 * string, or a keyword inside a comment, can't be mis-tokenized.
 */

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'new',
  'class',
  'extends',
  'super',
  'this',
  'typeof',
  'instanceof',
  'void',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'delete',
  'in',
  'of',
  'yield',
  'static',
  'get',
  'set',
  'import',
  'export',
  'from',
  'as',
])

const LITERALS = new Set(['null', 'undefined', 'true', 'false', 'NaN', 'Infinity'])

const PATTERN = new RegExp(
  [
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)', // 1 comment
    '(`(?:\\\\[\\s\\S]|[^`\\\\])*`|"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\\\n])*\')', // 2 string
    '(\\b\\d[\\w.]*\\b)', // 3 number
    '([A-Za-z_$][\\w$]*)', // 4 word (keyword / literal / function / plain)
  ].join('|'),
  'g',
)

/** @returns {Array<{ type: string, value: string }>} */
export function tokenize(code) {
  const out = []
  let last = 0
  let m

  PATTERN.lastIndex = 0
  while ((m = PATTERN.exec(code)) !== null) {
    if (m.index > last) out.push({ type: 'plain', value: code.slice(last, m.index) })

    if (m[1]) {
      out.push({ type: 'comment', value: m[1] })
    } else if (m[2]) {
      out.push({ type: 'string', value: m[2] })
    } else if (m[3]) {
      out.push({ type: 'number', value: m[3] })
    } else {
      const word = m[4]
      const after = code.slice(m.index + word.length)
      if (KEYWORDS.has(word)) out.push({ type: 'keyword', value: word })
      else if (LITERALS.has(word)) out.push({ type: 'literal', value: word })
      else if (/^\s*\(/.test(after)) out.push({ type: 'fn', value: word })
      else if (/^[A-Z]/.test(word)) out.push({ type: 'type', value: word })
      else out.push({ type: 'plain', value: word })
    }

    last = m.index + m[0].length
  }

  if (last < code.length) out.push({ type: 'plain', value: code.slice(last) })
  return out
}

export const TOKEN_CLASS = {
  comment: 'text-faint italic',
  string: 'text-[var(--tip)]',
  number: 'text-[var(--bonus)]',
  keyword: 'text-[var(--key)]',
  literal: 'text-[var(--warn)]',
  fn: 'text-[var(--info)]',
  type: 'text-[var(--accent-text)]',
  plain: '',
}
