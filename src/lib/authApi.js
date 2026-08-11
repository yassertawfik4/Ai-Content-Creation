const DEFAULT_AUTH_BASE = '/api'

export class AuthApiError extends Error {
  constructor(message, { code, status, data } = {}) {
    super(message)
    this.name = 'AuthApiError'
    this.code = code
    this.status = status
    this.data = data
  }
}

export function getAuthBase() {
  const fromEnv = import.meta.env?.VITE_AUTH_API_BASE_URL
  const base = (fromEnv && String(fromEnv).trim()) || DEFAULT_AUTH_BASE
  return base.replace(/\/$/, '')
}

export function getErrorMessage(error) {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

function extractError(data, fallback) {
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
  let response
  try {
    response = await fetch(`${getAuthBase()}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new AuthApiError(
      `Cannot reach the authentication API at ${getAuthBase()}. ` +
        'Check that the server is running and allows credentialed requests from this origin.',
      { data: error },
    )
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AuthApiError(
      extractError(data, `Request failed with status ${response.status}`),
      { code: data?.code, status: response.status, data },
    )
  }
  return data
}

export function signUpEmail({ name, email, password, image, callbackURL, rememberMe }) {
  return authFetch('/auth/sign-up/email', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, image, callbackURL, rememberMe }),
  })
}

export function signInEmail({ email, password, callbackURL, rememberMe }) {
  return authFetch('/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email, password, callbackURL, rememberMe }),
  })
}

export function signOut() {
  return authFetch('/auth/sign-out', { method: 'POST' })
}

export function updateUser({ name }) {
  return authFetch('/auth/update-user', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function changePassword({ currentPassword, newPassword, revokeOtherSessions }) {
  return authFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, revokeOtherSessions }),
  })
}

export function getSession({ disableCookieCache, disableRefresh } = {}) {
  const params = new URLSearchParams()
  if (disableCookieCache) params.set('disableCookieCache', 'true')
  if (disableRefresh) params.set('disableRefresh', 'true')
  const query = params.size ? `?${params.toString()}` : ''
  return authFetch(`/auth/session${query}`)
}

export function sendVerificationOtp({ email, type }) {
  return authFetch('/auth/email-otp/send-verification-otp', {
    method: 'POST',
    body: JSON.stringify({ email, type }),
  })
}

export function verifyEmailOtp({ email, otp }) {
  return authFetch('/auth/email-otp/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

export function signInEmailOtp({ email, otp, name, image }) {
  return authFetch('/auth/sign-in/email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, name, image }),
  })
}
