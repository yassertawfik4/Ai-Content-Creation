// Client for the backend billing API served at /api/subscriptions (proxied to
// the NestJS server in dev by vite.config.js). It relies on Better Auth's
// HTTP-only session cookie, so every request uses credentials.

const BASE = '/api/subscriptions'

export class BillingApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'BillingApiError'
    this.status = status
    this.data = data
  }
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

async function billingFetch(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
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
    throw new BillingApiError('Could not reach the billing service. Check that the server is running.', {
      data: error,
    })
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new BillingApiError(extractError(data, `Request failed with status ${response.status}`), {
      status: response.status,
      data,
    })
  }
  return data
}

/** The signed-in user's subscription (or null). Requires a session. */
export function getSubscription({ signal } = {}) {
  return billingFetch('/me', { signal })
}

/** The signed-in user's current generation-credit balance and reset date. */
export function getCreditUsage({ signal } = {}) {
  return billingFetch('/usage', { signal })
}

/**
 * Starts Stripe Checkout for a plan code + interval.
 * Returns { url } where the user is redirected to Stripe's hosted page.
 */
export function createCheckout({ planCode, interval }, { signal } = {}) {
  return billingFetch('/checkout', {
    method: 'POST',
    body: JSON.stringify({ planCode, interval }),
    signal,
  })
}

/** Switches the current subscription to another plan (prorated in Stripe). */
export function changePlan({ planCode, interval }, { signal } = {}) {
  return billingFetch('/plan', {
    method: 'PATCH',
    body: JSON.stringify({ planCode, interval }),
    signal,
  })
}

/** Returns Stripe's non-mutating prorated amount for an existing subscription. */
export function previewPlanChange({ planCode, interval }, { signal } = {}) {
  return billingFetch('/plan/preview', {
    method: 'POST',
    body: JSON.stringify({ planCode, interval }),
    signal,
  })
}

/** Immediately cancels the current subscription. */
export function cancelSubscription({ signal } = {}) {
  return billingFetch('/cancel', { method: 'POST', signal })
}

/** Opens Stripe's secure portal for payment methods and invoice history. */
export function createBillingPortal({ signal } = {}) {
  return billingFetch('/portal', { method: 'POST', signal })
}
