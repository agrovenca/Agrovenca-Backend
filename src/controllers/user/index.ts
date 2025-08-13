import { UserModel } from '@/models/User'
import { validateChangePassword, validatePartialUser } from '@/schemas/users'
import { UserFilterParams } from '@/types/User'
import { UnauthorizedError, ValidationError } from '@/utils/errors'
import { logoutUser } from '@/utils/logoutUser'
import { validatePasswords } from '@/utils/validatePasswords'
import { Request, Response } from 'express'
import { handleErrors } from '../handleErrors'
import { validateUserAccountSchema } from '@/schemas/users'
import { getCommonQueryFilters } from '@/utils/getCommonQueryFilters'
import { getPaginationData } from '@/utils/getPaginationData'

export class UserController {
  private model: typeof UserModel

  constructor({ model }: { model: typeof UserModel }) {
    this.model = model
  }

  getAll = async (req: Request, res: Response) => {
    const { limit, page, search } = getCommonQueryFilters(req.query)
    const isActive = req.query.isActive as UserFilterParams['isActive']

    const numericLimit = limit === 0 ? undefined : Number(limit)

    const offset = numericLimit ? (page - 1) * numericLimit : undefined

    try {
      const { objects, totalItems } = await this.model.getAll({
        offset,
        limit: numericLimit,
        search,
        isActive,
      })

      const totalPages = Math.ceil(totalItems / limit)

      res.json({
        objects: objects,
        pagination: {
          ...getPaginationData({ page, totalItems, totalPages }),
        },
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const user = await this.model.getById({ id })
      res.send(user)
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  getCurrentUser = async (req: Request, res: Response) => {
    const { user: currentUser } = req

    try {
      const user = await this.model.getById({ id: currentUser?.id })
      res.send(user)
    } catch (error) {
      handleErrors({ error, res })
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
      handleErrors({ error, res })
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
      handleErrors({ error, res })
    }
  }

  changeUserAccount = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const result = validateUserAccountSchema(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updated = await this.model.changeAccountOptions({ userId: id, data: result.data })

      res.status(200).json({ user: updated, message: 'Usuario actualizado correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
