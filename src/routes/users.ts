import { UserController } from '@/controllers/user'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { UserModel } from '@/models/User'
import { Router } from 'express'

export const createUserRouter = () => {
  const usersRouter = Router()
  const userController = new UserController({ model: UserModel })

  usersRouter.use(requireAuth)

  usersRouter.get('/', requireRole, userController.getAll)

  usersRouter.get('/me', userController.getCurrentUser)

  usersRouter.get('/:id', userController.getUser)

  usersRouter.patch('/:id', userController.update)

  usersRouter.patch('/change-password/:id', userController.changePassword)

  return usersRouter
}
