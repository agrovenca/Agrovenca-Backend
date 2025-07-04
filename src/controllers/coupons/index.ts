import { handleErrors } from '@/controllers/handleErrors'
import { CouponModel } from '@/models/Coupon'
import { validateCoupon, validatePartialCoupon } from '@/schemas/coupons'
import { ValidationError } from '@/utils/errors'
import { Request, Response } from 'express'

export class CouponController {
  private model: typeof CouponModel

  constructor({ model }: { model: typeof CouponModel }) {
    this.model = model
  }

  getAll = async (_req: Request, res: Response) => {
    try {
      const objects = await this.model.getAll()
      res.json(objects)
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  getObject = async (req: Request, res: Response) => {
    const { code } = req.params

    try {
      const object = await this.model.getObject({ code })
      res.status(200).send({ coupon: object, message: 'Cupón obtenido correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  create = async (req: Request, res: Response) => {
    try {
      const result = validateCoupon(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      if (result.data.type === 'PERCENTAGE' && result.data.discount > 100) {
        throw new ValidationError(
          'El cupón es de tipo % por lo tanto el descuento debe estar entre 0% y 100.0%',
        )
      }

      const newObject = await this.model.create({ data: result.data })
      res.status(201).send({
        newObject,
        message: 'Cupón creado correctamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = req.body
      const result = validatePartialCoupon(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.update({ id, data: result.data })

      res.status(200).json({ coupon: updatedObject, message: 'Cupón actualizado correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const deletedObject = await this.model.delete({ id })
      res.send({ coupon: deletedObject, message: 'Cupón eliminado exitosamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
