import { AtSign, BriefcaseBusiness, Camera, Music2, Users, Video } from 'lucide-react'
import { BRAND_VOICE_PRESETS, PLATFORM_OPTIONS } from '../schema/campaignSchema'

export const PLATFORM_ICONS = {
  instagram: Camera,
  x: AtSign,
  linkedin: BriefcaseBusiness,
  facebook: Users,
  tiktok: Music2,
  youtube_shorts: Video,
}

export const REGENERATABLE_STRATEGY_TABS = {
  personas: { section: 'personas', label: 'personas' },
  journey: { section: 'buyerJourney', label: 'buyer journey' },
  objectives: { section: 'smartObjectives', label: 'objectives' },
}

export const ART_GRADIENTS = [
  'from-[#f2d8b8] via-[#e7b58d] to-[#7c482e]',
  'from-[#d8d0ea] via-[#8a769f] to-[#34263f]',
  'from-[#f0b8c6] via-[#b95770] to-[#522232]',
  'from-[#bfe6cf] via-[#66b89a] to-[#1f5142]',
  'from-[#d6e8ff] via-[#6f9bd1] to-[#243a64]',
  'from-[#fde3b3] via-[#e3a86b] to-[#7a4a1a]',
]

export const WORKFLOW_STEPS = [
  { id: 'research', eventIds: ['build-brief', 'content-research'], label: 'Research', description: 'Builds the content brief and gathers current audience and trend signals.' },
  { id: 'strategize', eventIds: ['content-strategy'], label: 'Strategy', description: 'Turns the research into a narrative, pillars, and platform direction.' },
  { id: 'generate-content', eventIds: ['generate-content'], label: 'Copywriting', description: 'Writes the campaign posts for each selected platform.' },
  { id: 'qa', eventIds: ['content-preflight', 'qa-review', 'content-approval'], label: 'Editor QA', description: 'Checks claims, platform rules, and editorial quality.' },
  { id: 'generate-visuals', eventIds: ['generate-visuals'], label: 'Visual direction', description: 'Creates a complete visual prompt for every post.' },
  { id: 'generate-images', eventIds: ['generate-visuals'], label: 'Image generation', optional: 'images', description: 'Renders an image asset from each approved visual direction.' },
  { id: 'generate-hashtags', eventIds: ['generate-hashtags'], label: 'Hashtags & SEO', description: 'Adds platform-aware hashtags and search keywords.' },
  { id: 'schedule', eventIds: ['schedule', 'claim-audit'], label: 'Calendar', description: 'Schedules the posts and completes the final claim audit.' },
]

export const STRATEGY_STEPS = [
  { id: 'intake-gate', label: 'Brief validation', description: 'Checks that the campaign brief has enough context to begin.' },
  { id: 'product-analysis', label: 'Product analysis', description: 'Finds the clearest value proposition and product strengths.' },
  { id: 'stp-research', label: 'Market research', description: 'Collects current evidence about the market and audience.' },
  { id: 'stp-strategy', label: 'Positioning', description: 'Defines the target segment and market position.' },
  { id: 'buyer-persona', label: 'Buyer personas', description: 'Builds the primary buyer profiles for the campaign.' },
  { id: 'buyer-journey', label: 'Buyer journey', description: 'Maps audience needs and messages across the journey.' },
  { id: 'smart-objectives', label: 'SMART objectives', description: 'Sets measurable campaign goals and success criteria.' },
  { id: 'campaign-planner', label: 'Campaign plan', description: 'Combines every strategy decision into an actionable plan.' },
  { id: 'plan-quality-gate', label: 'Quality check', description: 'Audits the plan for evidence, gaps, and assumptions.' },
]

export const EMPTY_PROJECT = { id: '', name: 'Campaign workspace', color: '#d0bcff', historyCount: 0 }

export function getEvidenceDomain(source) {
  const publisher = String(source?.publisher ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]

  try {
    return new URL(source?.url).hostname.replace(/^www\./, '') || publisher || 'Source'
  } catch {
    return publisher || 'Source'
  }
}

export const CAMPAIGN_FORM_STEPS = [
  {
    id: 'basics',
    label: 'Basics',
    title: 'Tell us about the campaign',
    description: 'Start with the brand and the offer you want to bring to market.',
    isComplete: (values) => [values.brandName, values.product, values.industry, values.businessType].every((value) => value.trim()),
  },
  {
    id: 'audience',
    label: 'Audience',
    title: 'Who should this reach?',
    description: 'Set the campaign goal and describe the people you want to move.',
    isComplete: (values) => Boolean(values.campaignGoal && values.targetAudience.trim()),
  },
  {
    id: 'voice',
    label: 'Voice',
    title: 'Shape the campaign voice',
    description: 'Choose how the brand should sound and how often it should appear.',
    isComplete: (values) => Boolean(values.brandVoice.trim() && values.duration && Number(values.postsPerWeek) > 0),
  },
  {
    id: 'channels',
    label: 'Channels',
    title: 'Choose where it goes',
    description: 'Select publishing channels and add any final guidance for the team.',
    isComplete: (values) => values.platforms.length > 0,
  },
]

export const EMPTY_VALUES = {
  brandName: '',
  product: '',
  industry: '',
  businessType: '',
  pricing: '',
  campaignGoal: '',
  targetAudience: '',
  brandVoice: 'warm, friendly, comforting',
  voicePreset: 'warm',
  platforms: ['instagram', 'linkedin'],
  duration: '2 weeks',
  postsPerWeek: 3,
  generateImages: true,
  keyMessagesText: '',
  constraints: '',
}

export const TEST_VALUES = {
  brandName: 'Shark & Sprout',
  product: 'Playful baby t-shirts with cheerful shark illustrations, made from soft organic cotton for everyday adventures.',
  industry: 'Children’s apparel',
  businessType: 'Direct-to-consumer',
  pricing: '$28 per t-shirt or $72 for a three-pack, with free shipping over $50',
  campaignGoal: 'launch',
  targetAudience: 'Style-conscious parents and gift buyers, ages 25–40, shopping for children ages 0–5',
  brandVoice: 'playful, upbeat, reassuring',
  voicePreset: 'playful',
  platforms: ['instagram', 'tiktok', 'facebook'],
  duration: '2 weeks',
  postsPerWeek: 4,
  generateImages: true,
  keyMessagesText: 'Soft organic cotton for all-day comfort\nMade for tiny explorers and big imaginations\nEasy giftable three-packs for growing wardrobes',
  constraints: 'Avoid fear-based language and do not make unverified sustainability claims.',
}

export const GENERATE_STORAGE_KEY = 'aetherflow.generate.workspace.v1'

export function readGenerateState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(GENERATE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function mergeStoredValues(storedValues) {
  if (!storedValues || typeof storedValues !== 'object') return EMPTY_VALUES
  const platforms = Array.isArray(storedValues.platforms)
    ? storedValues.platforms.map((platform) => (platform === 'twitter' ? 'x' : platform))
    : EMPTY_VALUES.platforms
  return { ...EMPTY_VALUES, ...storedValues, platforms }
}

export const STRATEGY_GOALS = {
  awareness: 'awareness',
  launch: 'awareness',
  engagement: 'balanced',
  conversion: 'conversion',
  community: 'retention',
}

export function buildStrategyBrief(values) {
  const descriptionParts = [values.product]
  if (values.keyMessagesText.trim()) descriptionParts.push(`Key messages: ${values.keyMessagesText.trim()}`)

  return {
    description: descriptionParts.join('\n\n'),
    industry: values.industry,
    businessType: values.businessType,
    targetMarket: values.targetAudience || undefined,
    pricing: values.pricing || undefined,
    additionalNotes: [
      values.brandVoice ? `Brand voice: ${values.brandVoice}` : '',
      values.constraints ? `Constraints: ${values.constraints}` : '',
    ].filter(Boolean).join('\n'),
    intake: {
      targetGeography: 'unknown',
      primaryIcp: values.targetAudience,
      salesMotion: 'unknown',
      monthlyBudget: 'unknown',
      supportedIntegrations: ['unknown'],
      verifiedProofPoints: ['none verified'],
      prohibitedClaims: ['none specified'],
      baselineMetrics: {
        monthlyQualifiedVisits: 'unknown',
        monthlyLeads: 'unknown',
        trialOrDemoConversionRate: 'unknown',
        activationRate: 'unknown',
        paidConversionRate: 'unknown',
        monthlyChurnRate: 'unknown',
      },
    },
    options: {
      maxPersonas: 3,
      primaryGoal: STRATEGY_GOALS[values.campaignGoal] ?? 'balanced',
    },
  }
}

export function firstNonBlankString(...candidates) {
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() ?? ''
}

export function buildContentWorkflowInput(values, strategy, projectName) {
  const strategyProduct = strategy?.product
  const campaignStrategy = strategy?.campaignStrategy

  return {
    brandName: firstNonBlankString(values?.brandName, strategyProduct?.name, projectName),
    product: firstNonBlankString(
      values?.product,
      strategyProduct?.valueProposition,
      strategyProduct?.name,
      campaignStrategy?.summary,
    ),
    targetAudience: firstNonBlankString(
      values?.targetAudience,
      campaignStrategy?.audienceStrategy?.primaryAudience,
    ),
    platforms: Array.isArray(values?.platforms) && values.platforms.length
      ? values.platforms
      : EMPTY_VALUES.platforms,
    duration: firstNonBlankString(values?.duration, EMPTY_VALUES.duration),
    postsPerWeek: Number.isInteger(values?.postsPerWeek) && values.postsPerWeek > 0
      ? values.postsPerWeek
      : EMPTY_VALUES.postsPerWeek,
    generateImages: values?.generateImages !== false,
    requireApproval: false,
  }
}

export function hasBriefContent(values) {
  return Boolean(values?.brandName?.trim() || values?.product?.trim() || values?.targetAudience?.trim())
}

export function platformsFromChannels(channels) {
  if (!Array.isArray(channels)) return []
  const normalize = (name) => String(name ?? '').toLowerCase().replace(/[\s-]+/g, '_')
  return channels
    .map((channel) => {
      const key = normalize(typeof channel === 'string' ? channel : channel?.channel)
      if (!key) return ''
      if (key === 'twitter') return 'x'
      if (key === 'youtube' || key === 'shorts') return 'youtube_shorts'
      return PLATFORM_OPTIONS.some((option) => option.id === key) ? key : ''
    })
    .filter((id, index, all) => id && all.indexOf(id) === index)
}

// "Edit brief" can be reached long after the brief was submitted — reopening a
// chat from history restores only the strategy output, never the form values.
// Rebuild the brief from the strategy so the form is never blank behind it.
export function valuesFromStrategy(strategy, projectName) {
  if (!strategy) return { ...EMPTY_VALUES, platforms: [...EMPTY_VALUES.platforms] }

  const product = strategy.product ?? {}
  const campaignStrategy = strategy.campaignStrategy ?? {}
  const positioning = strategy.stp?.positioning ?? {}
  const creative = campaignStrategy.creativeDirection ?? {}
  const segments = Array.isArray(strategy.stp?.segments) ? strategy.stp.segments : []

  const brandVoice = firstNonBlankString(positioning.toneOfVoice, EMPTY_VALUES.brandVoice)
  const matchingPreset = BRAND_VOICE_PRESETS.find((preset) => preset.value === brandVoice)
  const keyMessages = (Array.isArray(creative.keyMessages) ? creative.keyMessages : [])
    .filter((message) => typeof message === 'string' && message.trim())
  const platforms = platformsFromChannels(campaignStrategy.primaryChannels)

  return {
    ...EMPTY_VALUES,
    brandName: firstNonBlankString(product.name, projectName),
    product: firstNonBlankString(product.valueProposition, product.name, campaignStrategy.summary),
    industry: firstNonBlankString(product.type),
    businessType: firstNonBlankString(product.businessType, campaignStrategy.audienceStrategy?.salesMotion),
    pricing: firstNonBlankString(product.pricingNotes),
    targetAudience: firstNonBlankString(
      campaignStrategy.audienceStrategy?.primaryAudience,
      segments[0]?.label,
      positioning.positioningStatement,
    ),
    brandVoice,
    voicePreset: matchingPreset?.id ?? 'custom',
    platforms: platforms.length ? platforms : [...EMPTY_VALUES.platforms],
    keyMessagesText: keyMessages.join('\n'),
  }
}
