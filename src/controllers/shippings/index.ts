import { ShippingModel } from '@/models/Shipping'
import { Request, Response } from 'express'
import { handleErrors } from '../handleErrors'
import { NotFoundError } from '@/utils/errors'
import { validateAddress } from '@/schemas/shippings'

export class ShippingController {
  private model: typeof ShippingModel

  constructor({ model }: { model: typeof ShippingModel }) {
    this.model = model
  }

  getAll = async (req: Request, res: Response) => {
    const { user } = req
    try {
      const objects = await this.model.getAll({ userId: user?.id })
      res.json(objects)
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  create = async (req: Request, res: Response) => {
    const { user } = req

    try {
      if (!user) throw new NotFoundError('Usuario no encontrado')

      const result = validateAddress(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newObject = await this.model.create({ userId: user?.id, data: result.data })
      res.status(201).send({
        address: newObject,
        message: 'Dirección creada correctamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
