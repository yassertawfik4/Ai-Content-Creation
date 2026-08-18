const DEFAULT_API_BASE = '/api'

export class AdminApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.data = data
  }
}

function getApiBase() {
  const configured = import.meta.env?.VITE_API_BASE_URL
  return ((configured && String(configured).trim()) || DEFAULT_API_BASE).replace(/\/$/, '')
}

function errorMessage(data, status) {
  if (Array.isArray(data?.message)) return data.message.join('; ')
  if (typeof data?.message === 'string') return data.message
  if (typeof data?.error === 'string') return data.error
  return `Dashboard request failed with status ${status}`
}

async function adminFetch(path, { signal } = {}) {
  let response
  try {
    response = await fetch(`${getApiBase()}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new AdminApiError('The dashboard API is unavailable. Check that the backend is running.', {
      data: error,
    })
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AdminApiError(errorMessage(data, response.status), {
      status: response.status,
      data,
    })
  }
  return data
}

function withQuery(path, values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })
  return params.size ? `${path}?${params.toString()}` : path
}

export function getDashboardOverview({ from, to, signal } = {}) {
  return adminFetch(withQuery('/admin/dashboard/overview', { from, to }), { signal })
}

export function getRevenueOverview({ signal } = {}) {
  return adminFetch('/admin/dashboard/revenue', { signal })
}

export function getRevenueByUser({ page = 1, limit = 100, signal } = {}) {
  return adminFetch(withQuery('/admin/dashboard/revenue/users', { page, limit }), { signal })
}

export function getRevenueByPlan({ page = 1, limit = 100, signal } = {}) {
  return adminFetch(withQuery('/admin/dashboard/revenue/plans', { page, limit }), { signal })
}

export function getAdminUsers({ page = 1, limit = 100, signal } = {}) {
  return adminFetch(withQuery('/admin/users', { page, limit }), { signal })
}

export function getAdminUserAnalytics(userId, { signal } = {}) {
  return adminFetch(`/admin/users/${encodeURIComponent(userId)}/analytics`, { signal })
}
