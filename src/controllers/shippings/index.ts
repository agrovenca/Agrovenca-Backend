import { ShippingModel } from '@/models/Shipping'
import { Request, Response } from 'express'
import { handleErrors } from '../handleErrors'
import { NotFoundError } from '@/utils/errors'
import { validateAddress, validateAddressUpdate } from '@/schemas/shippings'

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

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = req.body
      const result = validateAddressUpdate(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.update({ id, data: result.data })
      if (!updatedObject) throw new NotFoundError('Dirección no encontrada')

      res
        .status(200)
        .json({ address: updatedObject, message: 'Dirección actualizada exitosamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
