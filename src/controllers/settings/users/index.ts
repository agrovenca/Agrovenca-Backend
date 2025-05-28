import { handleErrors } from '@/controllers/handleErrors'
import { UserModel } from '@/models/User'
import { validateUserAccountSchema } from '@/schemas/settings/users'
import { Request, Response } from 'express'

export class SettingsUserController {
  private model: typeof UserModel

  constructor({ model }: { model: typeof UserModel }) {
    this.model = model
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
