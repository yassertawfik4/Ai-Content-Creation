import { DURATION_OPTIONS } from '../schema/campaignSchema'

export const SYSTEM_MAX_POSTS_PER_WEEK = 20

const FALLBACK_LIMITS = {
  free: { maxCampaignWeeks: 1, maxPostsPerWeek: 3 },
  pro: { maxCampaignWeeks: 3, maxPostsPerWeek: 6 },
  business: { maxCampaignWeeks: null, maxPostsPerWeek: null },
}

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
      maxCampaignWeeks: Math.max(...DURATION_OPTIONS.map(durationInWeeks).filter(Number.isFinite)),
      maxPostsPerWeek: SYSTEM_MAX_POSTS_PER_WEEK,
      isResolved: false,
      hasPlanCaps: false,
    }
  }

  const plan = creditUsage.plan
  const fallback = FALLBACK_LIMITS[plan.code] ?? FALLBACK_LIMITS.free
  const rawMaxWeeks = plan.maxCampaignWeeks === undefined
    ? fallback.maxCampaignWeeks
    : plan.maxCampaignWeeks
  const rawMaxPosts = plan.maxPostsPerWeek === undefined
    ? fallback.maxPostsPerWeek
    : plan.maxPostsPerWeek

  return {
    code: plan.code,
    name: plan.name,
    maxCampaignWeeks: rawMaxWeeks ?? Math.max(...DURATION_OPTIONS.map(durationInWeeks).filter(Number.isFinite)),
    maxPostsPerWeek: rawMaxPosts ?? SYSTEM_MAX_POSTS_PER_WEEK,
    isResolved: true,
    hasPlanCaps: rawMaxWeeks !== null || rawMaxPosts !== null,
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

  return { ...values, duration, postsPerWeek }
}

export function campaignLimitDescription(limits) {
  if (!limits.hasPlanCaps) {
    return `${limits.name} includes every campaign duration and up to ${limits.maxPostsPerWeek} posts per week.`
  }
  const duration = limits.maxCampaignWeeks === 1
    ? '1-week campaigns'
    : `campaigns up to ${limits.maxCampaignWeeks} weeks`
  return `${limits.name} includes ${duration} and up to ${limits.maxPostsPerWeek} posts per week.`
}
