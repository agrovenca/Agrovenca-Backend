import { CouponController } from '@/controllers/coupons'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { CouponModel } from '@/models/Coupon'
import { Router } from 'express'

export const couponsRouter = () => {
  const router = Router()
  const controller = new CouponController({ model: CouponModel })

  router.get('/', controller.getAll)

  router.use(requireAuth)
  router.get('/:code', controller.getObject)

  router.use(requireRole)
  router.post('/', controller.create)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  return router
}
