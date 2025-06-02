import { Category } from '@/schemas/categories'
import { getDataForUpdate } from '@/utils/getDataForUpdate'
import { Prisma, PrismaClient } from '@prisma/client'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'

const prisma = new PrismaClient()

export class CategoryModel {
  static async getById({ id }: { id: string }) {
    try {
      const category = await prisma.category.findUnique({
        where: { active: true, id },
      })
      if (!category) throw new NotFoundError('Categoría no encontrada')

      return category
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener la categoría')
    }
  }

  static async getAll() {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return categories
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener las categorías')
    }
  }

  static async create({ userId, data }: { userId: string; data: Category }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (!user) throw new NotFoundError('Usuario no encontrado')

      const newCategory = await prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
          user: { connect: { id: user.id } },
        },
      })

      return newCategory
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('La categoría ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar crear la categoría')
    }
  }

  static async update({ id, data }: { id: string; data: Category }) {
    const newData = getDataForUpdate(data)

    try {
      const category = await prisma.category.findUnique({
        where: { id },
      })

      if (!category) throw new NotFoundError('Categoría no encontrada')

      const updated = await prisma.category.update({
        where: { id },
        data: newData,
      })
      return updated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar la categoría')
    }
  }

  static async delete({ id }: { id: string }) {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
      })

      if (!category) throw new NotFoundError('Categoría no encontrada')

      const deleted = await prisma.category.delete({
        where: { id },
      })

      return deleted
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar eliminar la categoría')
    }
  }
}
