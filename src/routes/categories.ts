import { CategoriesController } from '@/controllers/categories'
import { requireAuth, requireRole } from '@/middlewares/auth'
import { CategoryModel } from '@/models/Category'
import { Router } from 'express'

export const createCategoriesRouter = () => {
  const router = Router()
  const controller = new CategoriesController({ model: CategoryModel })

  router.get('/', controller.getAll)
  router.get('/:id', controller.getObject)

  router.use(requireAuth)
  router.use(requireRole)

  router.post('/', controller.create)
  router.patch('/:id', controller.update)
  router.delete('/:id', controller.delete)

  return router
}
