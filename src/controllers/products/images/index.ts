import { handleErrors } from '@/controllers/handleErrors'
import { ProductImagesModel } from '@/models/Product/Images'
import { validateImageCreate } from '@/schemas/images'
import { MulterS3File } from '@/types/shared'
import { NotFoundError } from '@/utils/errors'
import { Request, Response } from 'express'

export class ProductImagesController {
  private model: typeof ProductImagesModel

  constructor({ model }: { model: typeof ProductImagesModel }) {
    this.model = model
  }

  getImagesByProduct = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params
      const objects = await this.model.getImagesByProduct({ productId })

      res.send({ productId: productId, images: objects })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  create = async (req: Request, res: Response) => {
    const { productId } = req.params
    const files = req.files as MulterS3File[]

    try {
      if (!productId) throw new NotFoundError('Imagen no encontrada')

      if (!Array.isArray(files)) {
        res.status(400).json({ error: 'Formato de archivos inválido' })
        return
      }

      const result = validateImageCreate({ files })

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newObjects = await this.model.create({ productId, data: result.data })
      res.status(201).json({
        images: newObjects,
        productId,
        message:
          newObjects.length > 1
            ? 'Imágenes registradas correctamente'
            : 'Imagen registrada correctamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  updateOrder = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params
      const { updatedImages } = req.body

      if (!Array.isArray(updatedImages)) {
        res.status(400).json({
          error: 'El cuerpo de la solicitud debe contener un array llamado "updatedImages"',
        })
        return
      }

      const hasInvalidItem = updatedImages.some(
        (item) => typeof item.id !== 'string' || typeof item.displayOrder !== 'number',
      )

      if (hasInvalidItem) {
        res.status(400).json({
          error: 'Cada imagen debe tener un "id" (string) y un "displayOrder" (number)',
        })
        return
      }

      const result = await this.model.updateOrder(productId, updatedImages)

      res.status(200).json({ message: 'Orden actualizado correctamente', images: result })
      return
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  delete = async (req: Request, res: Response) => {
    const { imageId, productId } = req.params

    try {
      const reorderedImages = await this.model.delete({ imageId, productId })
      res.send({ images: reorderedImages, message: 'Imagen eliminada correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
