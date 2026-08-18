const FALLBACK_WORDS = ['Campaign', 'Launch', 'Strategy', 'Plan']
const FILLER_WORDS = new Set([
  'a',
  'an',
  'and',
  'at',
  'for',
  'from',
  'in',
  'of',
  'on',
  'the',
  'to',
  'with',
])

/**
 * Gives a new campaign a useful title immediately while the title agent runs.
 * Keep this deterministic so the sidebar never has to wait on another model.
 */
export function buildFallbackChatTitle({ brandName, product }) {
  const candidates = `${brandName ?? ''} ${product ?? ''}`
    .replace(/[^\p{L}\p{N}'’–-]+/gu, ' ')
    .trim()
    .split(/\s+/u)
    .filter((word) => word && !FILLER_WORDS.has(word.toLocaleLowerCase()))
  const words = []

  for (const candidate of [...candidates, ...FALLBACK_WORDS]) {
    const word = candidate.slice(0, 22)
    if (!words.some((item) => item.toLocaleLowerCase() === word.toLocaleLowerCase())) {
      words.push(word)
    }
    if (words.length === 5) break
  }

  return words.slice(0, 5).join(' ')
}
