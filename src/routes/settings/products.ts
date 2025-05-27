import { ProductsController } from '@/controllers/settings/products'
import { ProductModel } from '@/models/Settings/Product'
import { Router } from 'express'

export const createProductsRouter = () => {
  const productsRouter = Router()
  const productsController = new ProductsController({ model: ProductModel })

  productsRouter.get('/', productsController.getAll)
  //   productsRouter.get('/:id', productsController.getObject)
  productsRouter.post('/', productsController.create)
  productsRouter.patch('/:id', productsController.update)
  productsRouter.delete('/:id', productsController.delete)

  return productsRouter
}
