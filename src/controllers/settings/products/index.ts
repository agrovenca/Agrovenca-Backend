import { ProductModel } from '@/models/Settings/Product'
import { validateProductCreate } from '@/schemas/settings/products'
import { AppError, NotFoundError } from '@/utils/errors'
import { Request, Response } from 'express'

export class ProductsController {
  private model: typeof ProductModel

  constructor({ model }: { model: typeof ProductModel }) {
    this.model = model
  }

  create = async (req: Request, res: Response) => {
    const { user } = req

    try {
      if (!user) throw new NotFoundError('Usuario no encontrado')

      const result = validateProductCreate(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newObject = await this.model.create({ userId: user.id, data: result.data })
      res.status(200).json({ product: newObject, message: 'Producto creado correctamente' })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
