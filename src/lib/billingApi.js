// Client for the backend billing API served at /api/subscriptions (proxied to
// the NestJS server in dev by vite.config.js). It relies on Better Auth's
// HTTP-only session cookie, so every request uses credentials.

import { getApiBase } from '@/lib/campaignApi'

/**
 * Resolved per call rather than at module load so the deployed API host from
 * VITE_API_BASE_URL is honoured; a hardcoded path only ever works behind the
 * dev proxy.
 */
function subscriptionsBase() {
  return `${getApiBase()}/subscriptions`
}

export { getErrorMessage } from '@/lib/errors'

export class BillingApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'BillingApiError'
    this.status = status
    this.data = data
  }
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
    response = await fetch(`${subscriptionsBase()}${path}`, {
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

/** The purchasable plan catalog, priced from the database. Public. */
export function getPlans({ signal } = {}) {
  return billingFetch('/plans', { signal })
}

/** The signed-in user's subscription (or null). Requires a session. */
export function getSubscription({ signal } = {}) {
  return billingFetch('/me', { signal, cache: 'no-store' })
}

/** The signed-in user's current generation-credit balance and reset date. */
export function getCreditUsage({ signal } = {}) {
  return billingFetch('/usage', { signal, cache: 'no-store' })
}

/**
 * Starts Stripe Checkout for a plan code + interval. Custom mode returns the
 * client secret consumed only by Stripe.js; hosted mode returns a redirect URL.
 */
export function createCheckout({ planCode, interval, uiMode }, { signal } = {}) {
  return billingFetch('/checkout', {
    method: 'POST',
    body: JSON.stringify({ planCode, interval, ...(uiMode ? { uiMode } : {}) }),
    signal,
  })
}

/**
 * Verifies and applies a completed Stripe Checkout after redirect. The backend
 * checks the authenticated user, Stripe customer, payment and trusted plan
 * metadata; this never trusts the URL alone and never creates another charge.
 */
export function confirmCheckout({ sessionId, planCode, interval } = {}, { signal } = {}) {
  return billingFetch('/checkout/confirm', {
    method: 'POST',
    body: JSON.stringify({
      ...(sessionId ? { sessionId } : {}),
      ...(planCode ? { planCode } : {}),
      ...(interval ? { interval } : {}),
    }),
    signal,
  })
}

/**
 * Applies a plan switch. Pass the `quoteId` from `previewPlanChange` so the
 * amount shown on the confirmation screen is the amount charged; the backend
 * answers 409 with a fresh quote if that price no longer holds.
 *
 * Custom mode resolves with a Stripe Elements `clientSecret`; hosted mode
 * resolves with `url`. Downgrades return neither because they are scheduled.
 */
export function changePlan({ planCode, interval, quoteId, uiMode }, { signal } = {}) {
  return billingFetch('/plan', {
    method: 'PATCH',
    body: JSON.stringify({
      planCode,
      interval,
      ...(quoteId ? { quoteId } : {}),
      ...(uiMode ? { uiMode } : {}),
    }),
    signal,
  })
}

/**
 * Prices a plan switch without applying it, and holds that price. Returns the
 * money breakdown plus what the switch does to the generation-credit balance.
 */
export function previewPlanChange({ planCode, interval }, { signal } = {}) {
  return billingFetch('/plan/preview', {
    method: 'POST',
    body: JSON.stringify({ planCode, interval }),
    signal,
  })
}

/** Drops a scheduled downgrade, keeping the current plan. */
export function cancelPendingPlanChange({ signal } = {}) {
  return billingFetch('/plan/pending', { method: 'DELETE', signal })
}

/** Immediately cancels the current subscription. */
export function cancelSubscription({ signal } = {}) {
  return billingFetch('/cancel', { method: 'POST', signal })
}

/** Opens Stripe's secure portal for payment methods and invoice history. */
export function createBillingPortal({ signal } = {}) {
  return billingFetch('/portal', { method: 'POST', signal })
}
