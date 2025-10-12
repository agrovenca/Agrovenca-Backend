import { OrderModel } from '@/models/Order'
import { Request, Response } from 'express'
import { handleErrors } from '../handleErrors'
import {
  validateOrderAdminUpdate,
  validateOrderCreate,
  validatePaymentCreate,
} from '@/schemas/orders'
import { resolveTemplatePath } from '@/utils/resolveTemplatePath'
import { getHtmlForEmailTemplate } from '@/utils/getHtmlForEmailTemplate'
import { sendUserEmail } from '@/utils/sendUserEmail'
import { AuthModel } from '@/models/Auth'
import { MulterS3File } from '@/types/shared'
import { NotFoundError, ValidationError } from '@/utils/errors'
import { getCommonQueryFilters } from '@/utils/getCommonQueryFilters'
import { getPaginationData } from '@/utils/getPaginationData'

const orderResumeTempPath = resolveTemplatePath('templates/order-resume.ejs')

export class OrderController {
  private model: typeof OrderModel

  constructor({ model }: { model: typeof OrderModel }) {
    this.model = model
  }

  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { limit, page, search } = getCommonQueryFilters(req.query)

      const numericLimit = limit === 0 ? undefined : Number(limit)
      const offset = numericLimit ? (page - 1) * numericLimit : undefined

      const { objects, totalItems } = await this.model.getAllOrders({
        offset,
        limit: numericLimit,
        search,
      })

      const totalPages = numericLimit ? Math.ceil(totalItems / numericLimit) : 1

      res.status(200).json({
        objects,
        pagination: {
          ...getPaginationData({ page, totalItems, totalPages }),
        },
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  getAllByUser = async (req: Request, res: Response) => {
    const { userId } = req.params
    try {
      const objects = await this.model.getAllByUser({ userId })
      res.status(200).send(objects)
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
      const order = await this.model.getById(id)
      res.status(200).send({ order, message: 'Orden obtenida correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  create = async (req: Request, res: Response) => {
    const { user } = req

    try {
      const result = validateOrderCreate(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      if (!user) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }

      const { name: userName, lastName: userLastName } = await AuthModel.loginByEmail({
        email: user.email,
      })

      const variables = {
        orderTotal: result.data.total,
        orderItems: result.data.products,
        currentYear: new Date().getFullYear(),
        userName: userName + ' ' + userLastName,
      }

      const html = await getHtmlForEmailTemplate(orderResumeTempPath, variables)
      await sendUserEmail({ toEmail: user.email, subject: 'Resumen de orden', html })

      const newOrder = await this.model.create({ data: result.data, userId: user.id })
      res.status(201).send({ order: newOrder, message: 'Orden creada correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  createPayment = async (req: Request, res: Response) => {
    const { orderId, userId } = req.params
    const file = req.file as MulterS3File

    try {
      if (!orderId) throw new ValidationError('No se encontró el ID de la orden')
      if (!userId) throw new ValidationError('No se encontró el ID del usuario')

      const result = validatePaymentCreate({ receipt: file })
      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newPayment = await this.model.createPayment({ orderId, userId, data: result.data })
      res.status(201).json({
        message: 'Comrpobante cargado',
        payment: newPayment,
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = req.body
      const result = validateOrderAdminUpdate(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.updateStatus({ id, data: result.data })
      if (!updatedObject) throw new NotFoundError('Orden no encontrada')

      res.status(200).json({ order: updatedObject, message: 'Orden actualizada exitosamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
