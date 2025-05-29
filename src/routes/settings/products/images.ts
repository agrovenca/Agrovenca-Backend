import { ProductImagesController } from '@/controllers/settings/products/images'
import { ProductImagesModel } from '@/models/Settings/Product/Images'
import { Router } from 'express'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })

export const createProductImagesRouter = () => {
  const router = Router()
  const controller = new ProductImagesController({ model: ProductImagesModel })

  router.get('/:productId', controller.getImagesByProduct)
  // router.get('/:id', controller.getObject)
  router.post('/:productId', upload.array('files'), controller.create)
  // router.patch('/order', controller.updateOrder)
  // router.patch('/:id', controller.update)
  // router.delete('/:id', controller.delete)

  return router
}
