import { CategoryModel } from '@/models/Settings/Category'
import { validateCategory } from '@/schemas/settings/categories'
import { AppError, NotFoundError } from '@/utils/errors'
import { Request, Response } from 'express'

export class CategoriesController {
  private model: typeof CategoryModel

  constructor({ model }: { model: typeof CategoryModel }) {
    this.model = model
  }

  getAll = async (_req: Request, res: Response) => {
    try {
      const objects = await this.model.getAll()
      res.json(objects)
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getObject = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const object = await this.model.getById({ id })
      res.send(object)
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

      const result = validateCategory(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newObject = await this.model.create({ userId: user?.id, data: result.data })
      res.status(201).send({
        category: newObject,
        message: 'Categoría creada correctamente',
      })
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
      const result = validateCategory(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.update({ id, data: result.data })
      if (!updatedObject) throw new NotFoundError('Categoría no encontrada')

      res
        .status(200)
        .json({ category: updatedObject, message: 'Categoría actualizada exitosamente' })
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
      res.send({ category: deletedObject, message: 'Category deleted successfully.' })
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
