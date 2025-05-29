import { ProductImagesController } from '@/controllers/settings/products/images'
import { ProductImagesModel } from '@/models/Settings/Product/Images'
import { getMulterS3Upload } from '@/utils/s3/s3Uploader'
import { Router } from 'express'

export const createProductImagesRouter = () => {
  const router = Router()
  const controller = new ProductImagesController({ model: ProductImagesModel })

  router.get('/:productId', controller.getImagesByProduct)
  // router.get('/:id', controller.getObject)
  router.post(
    '/:productId',
    async (req, res, next) => {
      const productId = req.params.productId
      const upload = getMulterS3Upload(productId).array('files')

      upload(req, res, (err) => {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }
        next()
      })
    },
    controller.create,
  )
  // router.patch('/order', controller.updateOrder)
  // router.patch('/:id', controller.update)
  // router.delete('/:id', controller.delete)

  return router
}
