import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6).max(20),
  passwordConfirm: z.string().min(6).max(20),
  name: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
})

export const userLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6).max(20),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(20),
  lastName: z.string().min(2).max(20),
})

export const userChangePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(20),
  password: z.string().min(6).max(20),
  passwordConfirm: z.string().min(6).max(20),
})

export const userResetPasswordSchema = z.object({
  newPassword: z.string().min(6).max(20),
  newPasswordConfirm: z.string().min(6).max(20),
})

export const userAccountSettingsSchema = z.object({
  isActive: z.boolean(),
  role: z.enum(['client', 'mod']),
})

export type User = z.infer<typeof userSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type UserChangePassword = z.infer<typeof userChangePasswordSchema>
export type UserResetPassword = z.infer<typeof userResetPasswordSchema>
export type UserAccountSetting = z.infer<typeof userAccountSettingsSchema>

export const validateUser = (user: User) => {
  return userSchema.safeParse(user)
}

export const validateUserLogin = (user: User) => {
  return userLoginSchema.safeParse(user)
}

export const validatePartialUser = (data: UserUpdate) => {
  return userUpdateSchema.partial().safeParse(data)
}

export const validateChangePassword = (data: UserChangePassword) => {
  return userChangePasswordSchema.safeParse(data)
}

export const validateResetPassword = (data: UserResetPassword) => {
  return userResetPasswordSchema.safeParse(data)
}

export const validateUserAccountSchema = (data: UserAccountSetting) => {
  return userAccountSettingsSchema.safeParse(data)
}
