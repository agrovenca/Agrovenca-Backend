import { UserController } from '@/controllers/user'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { UserModel } from '@/models/User'
import { Router } from 'express'

export const createUserRouter = () => {
  const router = Router()
  const controller = new UserController({ model: UserModel })

  router.use(requireAuth)
  router.get('/', requireRole, controller.getAll)
  router.get('/me', controller.getCurrentUser)
  router.get('/:id', controller.getUser)
  router.patch('/:id', controller.update)
  router.patch('/change-password/:id', controller.changePassword)
  router.patch('/change-account-option/:id', requireRole, controller.changeUserAccount)

  return router
}
