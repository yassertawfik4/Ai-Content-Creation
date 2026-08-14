// Shared billing formatters. These used to be copied into each page, which is
// how the interval default drifted between `month` and `year` across four files.

/**
 * Money from minor units. The currency comes from Stripe on every quote, so it
 * is never assumed to be USD.
 */
export function formatMoney(cents, currency = 'USD') {
  const amount = (cents ?? 0) / 100
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: String(currency || 'USD').toUpperCase(),
    minimumFractionDigits: Math.abs(cents ?? 0) % 100 === 0 ? 0 : 2,
  })
}

/**
 * The one place `MONTHLY`/`YEARLY` from the API and `month`/`year` from the URL
 * are reconciled. Anything unrecognised — including null — is monthly.
 */
export function normalizeInterval(value) {
  const raw = String(value ?? '').toUpperCase()
  return raw === 'YEARLY' || raw === 'YEAR' ? 'year' : 'month'
}

/** A date the customer can read, or null when there isn't one. */
export function formatBillingDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const ACTIVE_STATUSES = ['ACTIVE', 'TRIALING', 'PAST_DUE', 'UNPAID']

/** Statuses where Stripe needs the payment method fixed before anything else. */
export const PAYMENT_BLOCKED_STATUSES = ['PAST_DUE', 'UNPAID', 'PAUSED']

export function isActiveStatus(status) {
  return ACTIVE_STATUSES.includes(status)
}

export function isPaymentBlocked(status) {
  return PAYMENT_BLOCKED_STATUSES.includes(status)
}
