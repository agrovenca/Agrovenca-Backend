import { Router } from 'express'
import { ProductModel } from '@/models/Product'
import { ProductsController } from '@/controllers/products'
import { createProductImagesRouter } from './images'
import { requireAuth, requireRole } from '@/middlewares/auth'

export const productsRouter = () => {
  const router = Router()
  const controller = new ProductsController({ model: ProductModel })

  router.get('/', controller.getAll)
  router.get('/:id', controller.getSingle)
  router.post('/validateCart', controller.validateCart)

  router.use(requireAuth)
  router.use(requireRole)

  router.get('/export/:format', controller.export)
  router.post('/', controller.create)
  router.patch('/order', controller.updateOrder)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  router.use('/images', createProductImagesRouter())

  return router
}
