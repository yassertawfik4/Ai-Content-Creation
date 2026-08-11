import { z } from 'zod'

// Shared UI schemas for the legacy campaign shape and the marketing workflow
// handoff used by the connected generate flow.

export const platformEnum = z.enum([
  'x',
  'instagram',
  'linkedin',
  'facebook',
  'tiktok',
  'youtube_shorts',
])

export const campaignGoalEnum = z.enum([
  'awareness',
  'launch',
  'engagement',
  'conversion',
  'community',
])

export const campaignBriefSchema = z.object({
  brandName: z.string().trim().min(1, 'Brand name is required'),
  brandVoice: z.string().trim().min(1, 'Brand voice is required'),
  product: z.string().trim().min(1, 'Product or campaign is required'),
  campaignGoal: z
    .string()
    .trim()
    .min(1, 'Pick a campaign goal')
    .refine((value) => campaignGoalEnum.options.includes(value), 'Pick a campaign goal'),
  targetAudience: z.string().trim().min(1, 'Audience is required'),
  platforms: z.array(platformEnum).min(1, 'Select at least one platform'),
  duration: z.string().trim().min(1, 'Duration is required'),
  postsPerWeek: z
    .number({ message: 'Posts per week must be a number' })
    .int('Posts per week must be a whole number')
    .positive('Posts per week must be at least 1')
    .max(20, 'Posts per week is too high'),
  generateImages: z.boolean().optional().default(true),
  keyMessages: z.array(z.string()).optional().default([]),
  constraints: z.string().optional().default(''),
})

export const contentWorkflowInputSchema = z.object({
  brandName: z.string().trim().min(1, 'Brand name is required'),
  product: z.string().trim().min(1, 'Product or campaign is required'),
  targetAudience: z.string().trim().min(1, 'Audience is required'),
  platforms: z.array(platformEnum).min(1, 'Select at least one platform'),
  duration: z.string().trim().min(1, 'Duration is required'),
  postsPerWeek: z.number().int().positive().max(20),
  generateImages: z.boolean().optional().default(true),
  requireApproval: z.boolean().optional().default(false),
})

export const campaignOutputSchema = z.object({
  strategy: z.object({
    coreNarrative: z.string(),
    contentPillars: z.array(z.object({ name: z.string(), description: z.string() })),
    tonePerPlatform: z.record(z.string(), z.string()),
    rationale: z.string(),
  }),
  calendar: z.array(
    z.object({
      date: z.string(),
      platform: platformEnum,
      caption: z.string(),
      hashtags: z.array(z.string()).default([]),
      visualPrompt: z.string().default(''),
      imageUrl: z.string().optional(),
      cta: z.string().default(''),
    }),
  ),
  notes: z
    .array(
      z.object({
        postId: z.string().optional(),
        severity: z.enum(['info', 'warning', 'error']),
        message: z.string(),
        resolved: z.boolean(),
      }),
    )
    .default([]),
  sources: z.array(z.object({ url: z.string(), title: z.string(), retrievedAt: z.string().optional() })).optional(),
  claimVerification: z.record(z.string(), z.unknown()).optional(),
})

export const marketingStrategyInputSchema = z.object({
  description: z.string().trim().min(10, 'Add a product description of at least 10 characters'),
  industry: z.string().trim().min(2, 'Industry is required'),
  businessType: z.string().trim().min(2, 'Business type is required'),
  targetMarket: z.string().trim().optional(),
  pricing: z.string().trim().optional(),
  additionalNotes: z.string().trim().optional(),
  intake: z.object({
    targetGeography: z.string().trim().min(1),
    primaryIcp: z.string().trim().min(1),
    salesMotion: z.enum(['self-serve', 'sales-led', 'hybrid', 'unknown']),
    monthlyBudget: z.string().trim().min(1),
    supportedIntegrations: z.array(z.string().trim().min(1)).min(1),
    verifiedProofPoints: z.array(z.string().trim().min(1)).min(1),
    prohibitedClaims: z.array(z.string().trim().min(1)).min(1),
    baselineMetrics: z.object({
      monthlyQualifiedVisits: z.string().trim().min(1),
      monthlyLeads: z.string().trim().min(1),
      trialOrDemoConversionRate: z.string().trim().min(1),
      activationRate: z.string().trim().min(1),
      paidConversionRate: z.string().trim().min(1),
      monthlyChurnRate: z.string().trim().min(1),
    }),
  }),
  options: z.object({
    maxPersonas: z.number().int().min(1).max(3),
    primaryGoal: z.enum(['awareness', 'lead-generation', 'conversion', 'retention', 'balanced']),
  }),
})

export const marketingStrategyOutputSchema = z.object({
  product: z.unknown(),
  stp: z.unknown(),
  personas: z.array(z.unknown()),
  buyerJourney: z.array(z.unknown()),
  smartObjectives: z.array(z.unknown()),
  campaignStrategy: z.unknown(),
  planQuality: z.unknown(),
})

// Helpers used by the form to translate between UI labels and brief values.
export const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
]

export const CAMPAIGN_GOAL_OPTIONS = [
  { id: 'awareness', label: 'Awareness' },
  { id: 'launch', label: 'Product launch' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'community', label: 'Community' },
]

export const DURATION_OPTIONS = ['1 week', '2 weeks', '3 weeks', '1 month', '6 weeks']

export const BRAND_VOICE_PRESETS = [
  { id: 'warm', label: 'Warm', value: 'warm, friendly, comforting' },
  { id: 'bold', label: 'Bold', value: 'bold, confident, punchy' },
  { id: 'playful', label: 'Playful', value: 'playful, witty, lighthearted' },
  { id: 'professional', label: 'Professional', value: 'professional, clear, trustworthy' },
]
