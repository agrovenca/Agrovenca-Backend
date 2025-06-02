import { CouponController } from '@/controllers/coupons'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { CouponModel } from '@/models/Coupon'
import { Router } from 'express'

export const createCouponsRouter = () => {
  const router = Router()
  const controller = new CouponController({ model: CouponModel })

  router.get('/', controller.getAll)
  // router.get('/:id', controller.getObject)

  router.use(requireAuth)
  router.use(requireRole)

  router.post('/', controller.create)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  return router
}
