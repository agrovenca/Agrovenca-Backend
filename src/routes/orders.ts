import { OrderController } from '@/controllers/orders'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { OrderModel } from '@/models/Order'
import { Router } from 'express'

export const ordersRouter = () => {
  const router = Router()
  const controller = new OrderController({ model: OrderModel })

  router.use(requireAuth)
  router.get('/:userId', controller.getAllByUser)
  router.get('/:id', controller.getOrderById)
  router.post('/', controller.create)

  router.use(requireRole)
  router.get('/', controller.getAllOrders)
  // router.patch('/:id', controller.update)
  // router.delete('/:id', controller.delete)

  return router
}
