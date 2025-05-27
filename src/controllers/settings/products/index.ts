import { ProductModel } from '@/models/Settings/Product'
import { validateProductCreate, validateProductUpdate } from '@/schemas/settings/products'
import { AppError, NotFoundError } from '@/utils/errors'
import { Request, Response } from 'express'

export class ProductsController {
  private model: typeof ProductModel

  constructor({ model }: { model: typeof ProductModel }) {
    this.model = model
  }

  getAll = async (req: Request, res: Response) => {
    const { page, search } = req.query
    const pageNumber = Number(page) || 1
    const searchString = search?.toString()

    try {
      const { objects, totalItems, totalPages } = await this.model.getAll({
        page: pageNumber,
        search: searchString,
      })
      res.json({
        objects: objects,
        page: pageNumber,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
        nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
        previousPage: pageNumber > 1 ? pageNumber - 1 : null,
      })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
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
      res.status(201).json({ product: newObject, message: 'Producto creado correctamente' })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = req.body
      const result = validateProductUpdate(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.update({ id, data: result.data })

      res.status(200).json({ product: updatedObject, message: 'Producto actualizado exitosamente' })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
