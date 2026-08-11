import { z } from 'zod'

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter the name you want teammates to see.')
    .max(100, 'Keep your display name under 100 characters.'),
})

export const passwordSettingsSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Your current password must be at least 8 characters.')
      .max(128, 'Your current password is too long.'),
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters for your new password.')
      .max(128, 'Your new password is too long.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
    revokeOtherSessions: z.boolean(),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Choose a password you have not just used.',
    path: ['newPassword'],
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'The new passwords do not match.',
    path: ['confirmPassword'],
  })
