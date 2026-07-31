const DEFAULT_BASE = '/api'

const ACCESS_TOKEN_KEY = 'aetherflow.accessToken'
const REFRESH_TOKEN_KEY = 'aetherflow.refreshToken'
const USER_KEY = 'aetherflow.user'

export function getAuthBase() {
  const fromEnv = import.meta.env?.VITE_API_BASE_URL
  const base = (fromEnv && String(fromEnv).trim()) || DEFAULT_BASE
  return base.replace(/\/$/, '')
}

export function getStoredTokens() {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null }
  }
  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  }
}

export function storeAuthData({ accessToken, refreshToken, user }) {
  if (typeof window === 'undefined') return
  if (accessToken) window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthData() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getErrorMessage(error) {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

function extractErrorMessage(data, fallback) {
  const message = data?.message
  if (Array.isArray(message)) {
    const joined = message.filter(Boolean).join('; ')
    if (joined) return joined
  }
  if (typeof message === 'string' && message.trim()) return message
  if (typeof data?.error === 'string' && data.error.trim()) return data.error
  return fallback
}

async function authFetch(path, options = {}) {
  const { token, ...init } = options

  let res
  try {
    res = await fetch(`${getAuthBase()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(
      `Cannot reach the authentication API at ${getAuthBase()}. ` +
        'Check that the server is running and allows requests from this origin (CORS).',
      { cause: error },
    )
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, `Request failed with status ${res.status}`))
  }
  return data
}

export function login({ email, password }) {
  return authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register({ name, email, password }) {
  return authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function getCurrentUser(accessToken) {
  return authFetch('/auth/me', { token: accessToken })
}

export function refreshToken(refreshTokenValue) {
  return authFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })
}

export function logout(accessToken) {
  return authFetch('/auth/logout', {
    method: 'POST',
    token: accessToken,
  })
}
