import { CouponController } from '@/controllers/settings/coupons'
import { CouponModel } from '@/models/Settings/Coupon'
import { Router } from 'express'

export const createCouponsRouter = () => {
  const couponsRouter = Router()
  const couponsController = new CouponController({ model: CouponModel })

  couponsRouter.get('/', couponsController.getAll)
  // couponsRouter.get('/:id', couponsController.getObject)
  couponsRouter.post('/', couponsController.create)
  couponsRouter.patch('/:id', couponsController.update)
  couponsRouter.delete('/:id', couponsController.delete)

  return couponsRouter
}
