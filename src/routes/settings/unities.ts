import { UnityController } from '@/controllers/settings/unities'
import { UnityModel } from '@/models/Settings/Unity'
import { Router } from 'express'

export const createUnitiesRouter = () => {
  const unitiesRouter = Router()
  const unitiesController = new UnityController({ model: UnityModel })

  unitiesRouter.get('/', unitiesController.getAll)
  unitiesRouter.get('/:id', unitiesController.getObject)
  unitiesRouter.post('/', unitiesController.create)
  unitiesRouter.patch('/:id', unitiesController.update)
  unitiesRouter.delete('/:id', unitiesController.delete)

  return unitiesRouter
}
