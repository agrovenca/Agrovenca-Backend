import { OrderCreateType } from '@/schemas/orders'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const include = {
  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      price: true,
      product: {
        select: {
          name: true,
          images: true,
        },
      },
    },
  },
  shipping: true,
  coupon: {
    select: {
      code: true,
      discount: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      lastName: true,
    },
  },
}

export class OrderModel {
  static async getAllOrders() {
    try {
      const orders = await prisma.order.findMany({
        orderBy: [{ createdAt: 'desc' }],
        include: include,
      })

      if (!orders || orders.length === 0) throw new NotFoundError('No se encontraron órdenes')

      return orders
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener las órdenes')
    }
  }

  static async getAllByUser({ userId }: { userId: string }) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }],
        include: include,
      })

      if (!orders || orders.length === 0) throw new NotFoundError('No se encontraron órdenes')

      return orders
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener las órdenes')
    }
  }

  static async getById(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          coupon: {
            select: {
              code: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
          shipping: true,
        },
      })

      if (!order) throw new NotFoundError(`La orden no existe`)

      return order
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener la orden')
    }
  }

  static async create({ data, userId }: { data: OrderCreateType; userId: string }) {
    try {
      const { couponId, shippingAddressId, products, ...rest } = data
      const newOrder = await prisma.order.create({
        data: {
          ...rest,
          coupon: couponId
            ? {
                connect: { id: couponId },
              }
            : undefined,
          items: {
            createMany: {
              data: products.map((prod) => ({
                productId: prod.id,
                quantity: prod.quantity,
                price: prod.price,
              })),
            },
          },
          shipping: {
            connect: { pk: shippingAddressId },
          },
          user: {
            connect: { id: userId },
          },
        },
        include: {
          shipping: true,
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
          coupon: true,
        },
      })

      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: {
            timesUsed: {
              increment: 1,
            },
          },
        })
      }

      return newOrder
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('La orden ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar crear la orden')
    }
  }
}
