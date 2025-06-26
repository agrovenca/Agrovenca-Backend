import { AddressType } from '@/schemas/shippings'
import { AppError, ConflictError, ServerError } from '@/utils/errors'
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
}
