import { OrderController } from '@/controllers/orders'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { OrderModel } from '@/models/Order'
import { getMulterS3OrderUpload } from '@/utils/s3/s3Uploader'
import { Router } from 'express'

export const ordersRouter = () => {
  const router = Router()
  const controller = new OrderController({ model: OrderModel })

  router.use(requireAuth)
  router.get('/:userId', controller.getAllByUser)
  router.get('/:id', controller.getOrderById)
  router.post(
    '/:userId/:orderId',
    async (req, res, next) => {
      const { orderId } = req.params
      const upload = getMulterS3OrderUpload(orderId).single('receipt')

      upload(req, res, (err) => {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        next()
      })
    },
    controller.createPayment,
  )
  router.post('/', controller.create)

  router.use(requireRole)
  router.get('/', controller.getAllOrders)
  // router.patch('/:id', controller.update)
  // router.delete('/:id', controller.delete)

  return router
}
