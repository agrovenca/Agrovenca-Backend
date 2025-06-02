import { UnityController } from '@/controllers/unities'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { UnityModel } from '@/models/Unity'
import { Router } from 'express'

export const createUnitiesRouter = () => {
  const router = Router()
  const controller = new UnityController({ model: UnityModel })

  router.get('/', controller.getAll)
  router.get('/:id', controller.getObject)

  router.use(requireAuth)
  router.use(requireRole)

  router.post('/', controller.create)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  return router
}
