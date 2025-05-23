import { SettingsUserController } from '@/controllers/settings/users'
import { UserModel } from '@/models/User'
import { Router } from 'express'

export const createSettingsUserRouter = () => {
  const usersRouter = Router()
  const usersController = new SettingsUserController({ model: UserModel })

  usersRouter.patch('/change-account-option/:id', usersController.changeUserAccount)

  return usersRouter
}
