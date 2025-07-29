import { ShippingController } from '@/controllers/shippings'
import { requireAuth } from '@/middlewares/auth'
import { ShippingModel } from '@/models/Shipping'
import { Router } from 'express'

export const shippingRouter = () => {
  const router = Router()
  const controller = new ShippingController({ model: ShippingModel })

  router.use(requireAuth)

  router.get('/:userId', controller.getAll)
  router.post('/', controller.create)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  return router
}
