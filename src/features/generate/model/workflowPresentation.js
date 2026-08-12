export function formatQualityStatus(status) {
  return String(status ?? 'Review needed')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
