import { ProductsController } from '@/controllers/settings/products'
import { ProductModel } from '@/models/Settings/Product'
import { Router } from 'express'
import { createProductImagesRouter } from './images'

export const createProductsRouter = () => {
  const productsRouter = Router()
  const productsController = new ProductsController({ model: ProductModel })

  productsRouter.get('/', productsController.getAll)
  productsRouter.get('/export/:format', productsController.export)
  //   productsRouter.get('/:id', productsController.getObject)
  productsRouter.post('/', productsController.create)
  productsRouter.patch('/order', productsController.updateOrder)
  productsRouter.patch('/:id', productsController.update)
  productsRouter.delete('/:id', productsController.delete)

  productsRouter.use('/images', createProductImagesRouter())

  return productsRouter
}
