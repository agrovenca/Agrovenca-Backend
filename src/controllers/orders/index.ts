import { OrderModel } from '@/models/Order'
import { Request, Response } from 'express'
import { handleErrors } from '../handleErrors'
import { validateOrderCreate } from '@/schemas/orders'
import { resolveTemplatePath } from '@/utils/resolveTemplatePath'
import { getHtmlForEmailTemplate } from '@/utils/getHtmlForEmailTemplate'
import { sendUserEmail } from '@/utils/sendUserEmail'
import { AuthModel } from '@/models/Auth'

const orderResumeTempPath = resolveTemplatePath('templates/order-resume.ejs')

export class OrderController {
  private model: typeof OrderModel

  constructor({ model }: { model: typeof OrderModel }) {
    this.model = model
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
}
