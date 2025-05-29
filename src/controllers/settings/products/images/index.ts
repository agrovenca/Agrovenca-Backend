import { handleErrors } from '@/controllers/handleErrors'
import { ProductImagesModel } from '@/models/Settings/Product/Images'
import { validateImageCreate } from '@/schemas/settings/images'
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
    const files = req.files as Express.Multer.File[]

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
      res.status(201).json({ images: newObjects, message: 'Imagen registrada correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
