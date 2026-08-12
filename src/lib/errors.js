const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

export function getErrorMessage(error, fallback = DEFAULT_ERROR_MESSAGE) {
  if (typeof error === 'string' && error.trim()) return error.trim()

  if (Array.isArray(error?.message)) {
    const message = error.message.filter(Boolean).join('; ').trim()
    if (message) return message
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  if (typeof error?.error === 'string' && error.error.trim()) {
    return error.error.trim()
  }

  return fallback
}

export function isAbortError(error) {
  return error?.name === 'AbortError'
}
