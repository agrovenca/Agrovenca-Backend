import { OrderModel } from '@/models/Order'
import { Request, Response } from 'express'
import { handleErrors } from '../handleErrors'
import { validateOrderCreate } from '@/schemas/orders'
import { resolveTemplatePath } from '@/utils/resolveTemplatePath'
import ejs from 'ejs'
import { config } from '@/config'
import { transporter } from '@/utils/mailer'

const templatePath = resolveTemplatePath('templates/order-resume.ejs')
const { EMAIL_FROM } = config

export class OrderController {
  private model: typeof OrderModel

  constructor({ model }: { model: typeof OrderModel }) {
    this.model = model
  }

  getAll = async (req: Request, res: Response) => {
    const { user } = req
    try {
      if (!user) {
        res.status(401).json({ error: 'Usuario no autenticado' })
        return
      }
      const objects = await this.model.getAll({ userId: user.id })
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

      const html = await ejs.renderFile(templatePath, {
        orderTotal: result.data.total,
        orderItems: result.data.products,
        currentYear: new Date().getFullYear(),
        userName: `${user.name} ${user.lastName}`,
      })

      await transporter.sendMail({
        html,
        to: user.email,
        subject: 'Resumen de orden',
        from: `Agrovenca <${EMAIL_FROM}>`,
      })

      const newOrder = await this.model.create({ data: result.data, userId: user.id })
      res.status(201).send({ order: newOrder, message: 'Orden creada correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
