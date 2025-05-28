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
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 10, 1)
    const search = req.query.search?.toString() || ''
    const categoryId = req.query.categoryId?.toString() || ''

    const offset = (page - 1) * limit

    try {
      const { objects, totalItems } = await this.model.getAll({
        offset,
        limit,
        search,
        categoryId,
      })

      const totalPages = Math.ceil(totalItems / limit)

      res.json({
        objects: objects,
        page: page,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
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

  delete = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const deletedObject = await this.model.delete({ id })
      res.send({ product: deletedObject, message: 'Producto eliminado exitosamente' })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  updateOrder = async (req: Request, res: Response) => {
    try {
      const { updatedProducts } = req.body

      if (!Array.isArray(updatedProducts)) {
        res.status(400).json({
          error: 'El cuerpo de la solicitud debe contener un array llamado "updatedProducts"',
        })
        return
      }

      const hasInvalidItem = updatedProducts.some(
        (item) => typeof item.id !== 'string' || typeof item.displayOrder !== 'number',
      )

      if (hasInvalidItem) {
        res
          .status(400)
          .json({ error: 'Cada producto debe tener un "id" (string) y un "displayOrder" (number)' })
        return
      }

      const result = await this.model.updateOrder(updatedProducts)

      res.status(200).json({ message: 'Orden actualizado correctamente', result })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
