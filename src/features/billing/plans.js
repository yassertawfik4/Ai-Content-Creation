export const PRICING_PLANS = [
  {
    code: 'free',
    name: 'Free',
    description: 'Explore the full workflow and launch your first campaigns.',
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    generationCredits: 6,
    sortOrder: 0,
    eyebrow: 'Starter',
    features: ['Up to 3 complete campaigns', 'Strategy and content workflows', 'Community support'],
  },
  {
    code: 'pro',
    name: 'Pro',
    description: 'For creators and growing brands publishing consistently.',
    priceMonthlyCents: 1500,
    priceYearlyCents: 15000,
    generationCredits: 60,
    sortOrder: 1,
    eyebrow: 'Popular',
    highlight: true,
    features: ['Up to 30 complete campaigns', 'AI image generation', 'Advanced analytics', 'Priority support'],
  },
  {
    code: 'business',
    name: 'Business',
    description: 'Higher capacity and controls for ambitious marketing teams.',
    priceMonthlyCents: 4000,
    priceYearlyCents: 40000,
    generationCredits: 240,
    sortOrder: 2,
    eyebrow: 'Team',
    features: ['Up to 120 complete campaigns', 'Team workspaces', 'API access', 'Dedicated success manager'],
  },
]

export function getPlan(planCode) {
  return PRICING_PLANS.find((plan) => plan.code === planCode)
}

export function getPlanPrice(plan, interval) {
  return interval === 'year' ? plan.priceYearlyCents : plan.priceMonthlyCents
}

export function formatPlanPrice(cents) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })
}
