import { Unity } from '@/schemas/unities'
import { getDataForUpdate } from '@/utils/getDataForUpdate'
import { Prisma, PrismaClient } from '@prisma/client'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'

const prisma = new PrismaClient()

export class UnityModel {
  static async getById({ id }: { id: string }) {
    try {
      const unity = await prisma.unity.findUnique({
        where: { id },
      })
      if (!unity) throw new NotFoundError('Unidad no encontrada')

      return unity
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error getting unity by id')
    }
  }

  static async getAll() {
    try {
      const unities = await prisma.unity.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return unities
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener las unidades')
    }
  }

  static async create({ data }: { data: Unity }) {
    try {
      const newUnity = await prisma.unity.create({
        data: {
          name: data.name,
          description: data.description,
        },
      })

      return newUnity
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('La unidad ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar crear una unidad')
    }
  }

  static async update({ id, data }: { id: string; data: Unity }) {
    const newData = getDataForUpdate(data)

    try {
      const unity = await prisma.unity.findUnique({
        where: { id },
      })

      if (!unity) throw new NotFoundError('Unidad no encontrada')

      const updated = await prisma.unity.update({
        where: { id },
        data: newData,
      })
      return updated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar la unidad')
    }
  }

  static async delete({ id }: { id: string }) {
    try {
      const unity = await prisma.unity.findUnique({
        where: { id },
      })

      if (!unity) throw new NotFoundError('Unidad no encontrada')

      const deleted = await prisma.unity.delete({
        where: { id },
      })

      return deleted
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error deletting unity')
    }
  }
}
