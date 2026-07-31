import { z } from 'zod'

// Mirrors the backend `campaignBriefSchema` so the frontend validates exactly
// what the workflow expects before hitting the API.

export const platformEnum = z.enum([
  'twitter',
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
})

// Helpers used by the form to translate between UI labels and brief values.
export const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter', label: 'X / Twitter' },
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
