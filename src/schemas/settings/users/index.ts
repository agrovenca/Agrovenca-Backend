import { z } from 'zod'

export const UserAccountSettingsSchema = z.object({
  isActive: z.boolean(),
  role: z.enum(['client', 'mod']),
})

export type UserAccountSetting = z.infer<typeof UserAccountSettingsSchema>

export const validateUserAccountSchema = (data: UserAccountSetting) => {
  return UserAccountSettingsSchema.safeParse(data)
}
