import { UserModel } from '@/models/User'
import { validateChangePassword, validatePartialUser } from '@/schemas/user'
import { AppError, UnauthorizedError, ValidationError } from '@/utils/errors'
import { logoutUser } from '@/utils/logoutUser'
import { validatePasswords } from '@/utils/validatePasswords'
import { Request, Response } from 'express'

export class UserController {
  private model: typeof UserModel

  constructor({ model }: { model: typeof UserModel }) {
    this.model = model
  }

  getAll = async (req: Request, res: Response) => {
    const { page, search } = req.query
    const pageNumber = Number(page) || 1
    const searchString = search?.toString()

    try {
      const result = await this.model.getAll({
        page: pageNumber,
        search: searchString,
      })
      res.json({
        objects: result.objects,
        page: pageNumber,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: pageNumber < result.totalPages,
        hasPreviousPage: pageNumber > 1,
        nextPage: pageNumber < result.totalPages ? pageNumber + 1 : null,
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

  getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const user = await this.model.getById({ id })
      res.send(user)
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getCurrentUser = async (req: Request, res: Response) => {
    const { user: currentUser } = req

    try {
      const user = await this.model.getById({ id: currentUser?.id })
      res.send(user)
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { user: currentUser } = req

    try {
      if (currentUser?.id !== id && currentUser?.role !== 'admin')
        throw new UnauthorizedError('No tienes permisos para realizar esta acción')

      const data = req.body
      const result = validatePartialUser(data)
      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedUser = await this.model.update({ id, data: result.data })
      res.status(200).json(updatedUser)
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  changePassword = async (req: Request, res: Response) => {
    try {
      const data = req.body
      const result = validateChangePassword(data)
      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const { currentPassword, password, passwordConfirm } = result.data

      validatePasswords(password, passwordConfirm)

      if (currentPassword === password)
        throw new ValidationError('La nueva contraseña no puede ser igual a la actual')

      const { id } = req.params
      await this.model.changePassword({ id, data: result.data })

      logoutUser(req, res, 'Contraseña cambiada correctamente')
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message })
        return
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
