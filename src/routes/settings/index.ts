import { requireAuth, requireRole } from '@/middlewares/auth'
import { Router } from 'express'
import { createCategoriesRouter } from './categories'
import { createUnitiesRouter } from './unities'
import { createSettingsUserRouter } from './user'
import { createCouponsRouter } from './coupons'
import { createProductsRouter } from './products'

export const settingsRouter = () => {
  const settingsRouter = Router()

  settingsRouter.use(requireAuth)
  settingsRouter.use(requireRole)

  settingsRouter.use('/categories', createCategoriesRouter())
  settingsRouter.use('/unities', createUnitiesRouter())
  settingsRouter.use('/users', createSettingsUserRouter())
  settingsRouter.use('/coupons', createCouponsRouter())
  settingsRouter.use('/products', createProductsRouter())

  return settingsRouter
}
