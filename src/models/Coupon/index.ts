import { CouponType as Coupon, CouponUpdateType } from '@/schemas/coupons'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { getDataForUpdate } from '@/utils/getDataForUpdate'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CouponModel {
  static async getAll() {
    try {
      const objects = await prisma.coupon.findMany({
        orderBy: [{ expiresAt: 'desc' }, { createdAt: 'desc' }],
      })

      return objects
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener cupones')
    }
  }

  static async getObject({ code }: { code: string }) {
    try {
      const object = await prisma.coupon.findUnique({
        where: { code },
      })

      if (!object) throw new NotFoundError(`Cupón con código ${code} no existe`)
      if (object.expiresAt && object.expiresAt < new Date()) {
        throw new NotFoundError(`Cupón con código ${code} ha expirado`)
      }
      if (!object.active) throw new NotFoundError(`Cupón con código ${code} no está activo`)
      if (object.usageLimit && object.usageLimit <= object.timesUsed) {
        throw new NotFoundError(`Cupón con código ${code} ha alcanzado su límite de uso`)
      }

      return object
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener el cupón')
    }
  }

  static async create({ data }: { data: Coupon }) {
    try {
      const newObject = await prisma.coupon.create({
        data: {
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
      })

      return newObject
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('El cupón ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar crear el cupón')
    }
  }

  static async update({ id, data }: { id: string; data: Partial<CouponUpdateType> }) {
    const newData = getDataForUpdate(data, ['expiresAt'])

    try {
      const coupon = await prisma.coupon.findUnique({ where: { id } })

      if (!coupon) throw new NotFoundError('Cupón no encontrado')

      const updated = await prisma.coupon.update({
        where: { id },
        data: newData,
      })
      return updated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar el cupón')
    }
  }

  static async delete({ id }: { id: string }) {
    try {
      const object = await prisma.coupon.findUnique({
        where: { id },
      })

      if (!object) throw new NotFoundError('Cupón no encontrado')

      const deleted = await prisma.coupon.delete({
        where: { id },
      })

      return deleted
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar eliminar el cupón')
    }
  }
}
