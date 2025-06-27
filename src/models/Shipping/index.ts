import { AddressPartialType, AddressType } from '@/schemas/shippings'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { getDataForUpdate } from '@/utils/getDataForUpdate'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class ShippingModel {
  static async getAll({ userId }: { userId: string }) {
    try {
      const objects = await prisma.shippingAddress.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
      return objects
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener las direcciones de envío')
    }
  }

  static async create({ userId, data }: { userId: string; data: AddressType }) {
    try {
      const newAddress = await prisma.shippingAddress.create({
        data: {
          ...data,
          user: { connect: { id: userId } },
        },
      })

      return newAddress
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('La dirección ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar crear la dirección')
    }
  }

  static async update({ id, data }: { id: string; data: AddressPartialType }) {
    const newData = getDataForUpdate(data)

    try {
      const address = await prisma.shippingAddress.findUnique({
        where: { pk: id },
      })

      if (!address) throw new NotFoundError('Dirección no encontrada')

      const updated = await prisma.shippingAddress.update({
        where: { pk: id },
        data: newData,
      })
      return updated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar la dirección')
    }
  }
}
