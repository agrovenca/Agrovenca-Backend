import { handleErrors } from '@/controllers/handleErrors'
import { UnityModel } from '@/models/Settings/Unity'
import { validateUnity } from '@/schemas/settings/unities'
import { Request, Response } from 'express'

export class UnityController {
  private model: typeof UnityModel

  constructor({ model }: { model: typeof UnityModel }) {
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
    const { id } = req.params

    try {
      const object = await this.model.getById({ id })
      res.send(object)
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  create = async (req: Request, res: Response) => {
    try {
      const result = validateUnity(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const newObject = await this.model.create({ data: result.data })
      res.status(201).send({
        unity: newObject,
        message: 'Unidad creada correctamente',
      })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const data = req.body
      const result = validateUnity(data)

      if (!result.success) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const updatedObject = await this.model.update({ id, data: result.data })

      res.status(200).json({ unity: updatedObject, message: 'Unidad actualizada correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const deletedObject = await this.model.delete({ id })
      res.send({ unity: deletedObject, message: 'Unidad eliminada exitosamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
