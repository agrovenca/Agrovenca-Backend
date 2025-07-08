import { OrderController } from '@/controllers/orders'
import { requireAuth } from '@/middlewares/auth'
import { OrderModel } from '@/models/Order'
import { Router } from 'express'

export const ordersRouter = () => {
  const router = Router()
  const controller = new OrderController({ model: OrderModel })

  router.use(requireAuth)
  router.get('/', controller.getAll)
  router.get('/:id', controller.getOrderById)
  router.post('/', controller.create)

  // router.use(requireRole)
  // router.patch('/:id', controller.update)
  // router.delete('/:id', controller.delete)

  return router
}
