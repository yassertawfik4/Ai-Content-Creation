// Plans are priced in the database and served by GET /api/subscriptions/plans.
// Only what the backend has no opinion about — marketing copy and which card
// gets the badge — lives here, keyed by plan code. Prices and credit counts are
// never duplicated client-side, so a repricing cannot leave the UI lying.

const PLAN_PRESENTATION = {
  free: {
    eyebrow: 'Starter',
    features: [
      '1-week campaigns',
      'Up to 3 posts per week',
      '1 platform per campaign',
      'Text-only posts',
      'Community support',
    ],
  },
  pro: {
    eyebrow: 'Popular',
    highlight: true,
    features: [
      'Campaigns up to 3 weeks',
      'Up to 6 posts per week',
      'Up to 3 platforms per campaign',
      'AI image generation',
      'Priority support',
    ],
  },
  business: {
    eyebrow: 'Team',
    features: [
      'Campaigns up to 4 weeks',
      'Up to 20 posts per week',
      'Up to 6 platforms per campaign',
      'AI image generation',
      'Dedicated success manager',
    ],
  },
}

const FALLBACK_PRESENTATION = { eyebrow: null, highlight: false, features: [] }

/** Merges a plan row from the API with its local presentation metadata. */
export function decoratePlan(plan) {
  return {
    ...FALLBACK_PRESENTATION,
    ...(PLAN_PRESENTATION[plan.code] ?? {}),
    ...plan,
    priceMonthlyCents: plan.priceMonthlyCents ?? 0,
    priceYearlyCents: plan.priceYearlyCents ?? 0,
  }
}

export function decoratePlans(plans) {
  return [...plans]
    .map(decoratePlan)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function getPlanPrice(plan, interval) {
  return interval === 'year' ? plan.priceYearlyCents : plan.priceMonthlyCents
}

/** Money saved over a year by paying yearly, or 0 when there is no discount. */
export function yearlySavingCents(plan) {
  const monthlyForAYear = (plan.priceMonthlyCents ?? 0) * 12
  return Math.max(0, monthlyForAYear - (plan.priceYearlyCents ?? 0))
}

/**
 * The headline yearly discount, derived from the catalog so the badge follows a
 * repricing instead of advertising a stale "Save 17%".
 */
export function bestYearlySavingPercent(plans) {
  return plans.reduce((best, plan) => {
    const monthlyForAYear = (plan.priceMonthlyCents ?? 0) * 12
    if (monthlyForAYear <= 0) return best
    const percent = Math.round((yearlySavingCents(plan) / monthlyForAYear) * 100)
    return Math.max(best, percent)
  }, 0)
}
