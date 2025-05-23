import { CategoriesController } from '@/controllers/settings/categories'
import { CategoryModel } from '@/models/Settings/Category'
import { Router } from 'express'

export const createCategoriesRouter = () => {
  const categoriesRouter = Router()
  const categoriesController = new CategoriesController({ model: CategoryModel })

  categoriesRouter.get('/', categoriesController.getAll)
  categoriesRouter.get('/:id', categoriesController.getObject)
  categoriesRouter.post('/', categoriesController.create)
  categoriesRouter.patch('/:id', categoriesController.update)
  categoriesRouter.delete('/:id', categoriesController.delete)

  return categoriesRouter
}
