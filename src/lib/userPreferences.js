const preferenceStorageKey = 'aetherflow:user-preferences:v1'
const hexColorPattern = /^#[0-9a-f]{6}$/i
const supportedThemes = new Set(['light', 'dark', 'system'])

export const defaultPreferences = Object.freeze({
  reduceMotion: false,
  theme: 'system',
  accentColor: '#4f378a',
})

let activePreferences = defaultPreferences
let colorSchemeQuery

function normalizePreferences(preferences = {}) {
  return {
    reduceMotion: Boolean(preferences.reduceMotion),
    theme: supportedThemes.has(preferences.theme) ? preferences.theme : defaultPreferences.theme,
    accentColor: hexColorPattern.test(preferences.accentColor || '')
      ? preferences.accentColor.toLowerCase()
      : defaultPreferences.accentColor,
  }
}

function resolvedTheme(theme) {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function accentForeground(hexColor) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hexColor.slice(index, index + 2), 16) / 255)
  const [red, green, blue] = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ))
  const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue)
  return luminance > 0.48 ? '#241d29' : '#ffffff'
}

function applyTheme(preferences) {
  const root = document.documentElement
  const currentTheme = resolvedTheme(preferences.theme)

  root.classList.toggle('dark', currentTheme === 'dark')
  root.dataset.theme = preferences.theme
  root.dataset.resolvedTheme = currentTheme
  root.dataset.reduceMotion = String(preferences.reduceMotion)
  root.style.colorScheme = currentTheme
  root.style.setProperty('--aether-accent', preferences.accentColor)
  root.style.setProperty('--aether-on-accent', accentForeground(preferences.accentColor))
}

function watchSystemTheme() {
  if (colorSchemeQuery) return

  colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  colorSchemeQuery.addEventListener('change', () => {
    if (activePreferences.theme === 'system') applyTheme(activePreferences)
  })
}

export function readUserPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceStorageKey) || '{}')
    return normalizePreferences(saved)
  } catch {
    return { ...defaultPreferences }
  }
}

export function applyUserPreferences(preferences = readUserPreferences()) {
  activePreferences = normalizePreferences(preferences)
  watchSystemTheme()
  applyTheme(activePreferences)
  return activePreferences
}

export function saveUserPreferences(preferences) {
  const normalized = normalizePreferences(preferences)
  localStorage.setItem(preferenceStorageKey, JSON.stringify(normalized))
  return applyUserPreferences(normalized)
}
