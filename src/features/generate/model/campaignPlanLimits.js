import { DURATION_OPTIONS } from '../schema/campaignSchema'

export const SYSTEM_MAX_POSTS_PER_WEEK = 20
export const SYSTEM_MAX_PLATFORMS = 6

/**
 * The pipeline's own ceiling on posts per run. A campaign larger than this is
 * refused by the server, so the picker says so before the user submits.
 */
export const SYSTEM_MAX_POSTS_PER_RUN = 60

const FALLBACK_LIMITS = {
  free: {
    maxCampaignWeeks: 1,
    maxPostsPerWeek: 3,
    maxPlatforms: 1,
    allowsImageGeneration: false,
  },
  pro: {
    maxCampaignWeeks: 3,
    maxPostsPerWeek: 6,
    maxPlatforms: 3,
    allowsImageGeneration: true,
  },
  business: {
    maxCampaignWeeks: 4,
    maxPostsPerWeek: 20,
    maxPlatforms: 6,
    allowsImageGeneration: true,
  },
}

const MAX_DURATION_WEEKS = Math.max(
  ...DURATION_OPTIONS.map(durationInWeeks).filter(Number.isFinite),
)

export function durationInWeeks(value) {
  const match = String(value ?? '').trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)$/)
  if (!match) return null

  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (match[2].startsWith('day')) return amount / 7
  if (match[2].startsWith('month')) return amount * 4
  return amount
}

export function getCampaignPlanLimits(creditUsage) {
  if (!creditUsage?.plan) {
    return {
      code: null,
      name: 'Current plan',
      maxCampaignWeeks: MAX_DURATION_WEEKS,
      maxPostsPerWeek: SYSTEM_MAX_POSTS_PER_WEEK,
      maxPlatforms: SYSTEM_MAX_PLATFORMS,
      allowsImageGeneration: true,
      isResolved: false,
      hasPlanCaps: false,
    }
  }

  const plan = creditUsage.plan
  const fallback = FALLBACK_LIMITS[plan.code] ?? FALLBACK_LIMITS.free
  const pick = (value, fallbackValue) =>
    value === undefined ? fallbackValue : value

  const rawMaxWeeks = pick(plan.maxCampaignWeeks, fallback.maxCampaignWeeks)
  const rawMaxPosts = pick(plan.maxPostsPerWeek, fallback.maxPostsPerWeek)
  const rawMaxPlatforms = pick(plan.maxPlatforms, fallback.maxPlatforms)

  return {
    code: plan.code,
    name: plan.name,
    maxCampaignWeeks: rawMaxWeeks ?? MAX_DURATION_WEEKS,
    maxPostsPerWeek: rawMaxPosts ?? SYSTEM_MAX_POSTS_PER_WEEK,
    maxPlatforms: rawMaxPlatforms ?? SYSTEM_MAX_PLATFORMS,
    allowsImageGeneration:
      pick(plan.allowsImageGeneration, fallback.allowsImageGeneration) ?? true,
    isResolved: true,
    hasPlanCaps:
      rawMaxWeeks !== null ||
      rawMaxPosts !== null ||
      rawMaxPlatforms !== null,
  }
}

export function getAvailableDurations(maxCampaignWeeks) {
  return DURATION_OPTIONS.filter((duration) => durationInWeeks(duration) <= maxCampaignWeeks)
}

export function clampCampaignValues(values, limits) {
  const availableDurations = getAvailableDurations(limits.maxCampaignWeeks)
  const currentWeeks = durationInWeeks(values.duration)
  const duration = currentWeeks !== null && currentWeeks <= limits.maxCampaignWeeks
    ? values.duration
    : availableDurations.at(-1)

  const numericPosts = Number(values.postsPerWeek)
  const postsPerWeek = Number.isFinite(numericPosts)
    ? Math.min(limits.maxPostsPerWeek, Math.max(1, numericPosts))
    : 1

  // A downgrade can leave more platforms selected than the new plan allows.
  // Trimming from the end keeps the user's first choices, which are the ones
  // they picked most deliberately.
  const platforms = Array.isArray(values.platforms)
    ? values.platforms.slice(0, limits.maxPlatforms)
    : values.platforms

  const generateImages = limits.allowsImageGeneration
    ? values.generateImages
    : false

  return { ...values, duration, postsPerWeek, platforms, generateImages }
}

/**
 * What a campaign costs in credits: one for the strategy, plus one for every
 * post the run will generate. Mirrors
 * `Backend/.../src/common/billing/campaign-credit-cost.ts`, which is
 * authoritative — this copy exists so the form can show the price before the
 * server charges it.
 */
export const STRATEGY_CREDIT_COST = 1

export function campaignPostCount({ duration, postsPerWeek, platforms }) {
  const weeks = durationInWeeks(duration)
  const posts = Number(postsPerWeek)
  const platformCount = Array.isArray(platforms) ? platforms.length : 0
  if (weeks === null || !Number.isFinite(posts) || posts < 1 || platformCount < 1) {
    return null
  }
  return Math.max(1, Math.ceil(weeks * posts) * platformCount)
}

/** Credits the content run alone will cost, or null when the shape is incomplete. */
export function contentRunCreditCost(values) {
  return campaignPostCount(values)
}

/** Credits a whole campaign costs: the strategy plus every post. */
export function campaignCreditCost(values) {
  const posts = campaignPostCount(values)
  return posts === null ? null : posts + STRATEGY_CREDIT_COST
}

export function campaignLimitDescription(limits) {
  const parts = []
  parts.push(
    limits.maxCampaignWeeks === 1
      ? '1-week campaigns'
      : `campaigns up to ${limits.maxCampaignWeeks} weeks`,
  )
  parts.push(`up to ${limits.maxPostsPerWeek} posts per week`)
  parts.push(
    `${limits.maxPlatforms} ${limits.maxPlatforms === 1 ? 'platform' : 'platforms'}`,
  )
  return `${limits.name} includes ${parts.join(', ')}.`
}
