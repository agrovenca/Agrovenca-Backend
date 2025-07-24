import { Prisma, PrismaClient } from '@prisma/client'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { ProductCreateType, ProductUpdateType } from '@/schemas/products'
import slugify from 'slugify'
import { getDataForUpdate } from '@/utils/getDataForUpdate'
import { ProductFilterParams } from '@/types/Product'

const prisma = new PrismaClient()

export interface CartItem {
  productId: string
  quantity: number
}

interface UpdateOrderParams {
  id: string
  displayOrder: number
}

async function generateUniqueSlug(text: string): Promise<string> {
  const baseSlug = slugify(text, { replacement: '-', lower: true, strict: true, trim: true })
  let slug = baseSlug
  let count = 1

  // Asegura que el slug sea único
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count}`
    count++
  }

  return slug
}

export class ProductModel {
  static async getSingle({ slug }: { slug: string }) {
    try {
      const object = await prisma.product.findUnique({
        where: { slug },
        include: { images: true },
      })
      return object
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener el producto por slug')
    }
  }

  static async getAll(params: ProductFilterParams) {
    const search = params.search ?? ''
    const categoriesId = params.categoriesId ?? []
    const unitiesId = params.unitiesId ?? []
    const priceRange = params.priceRange ?? []
    const inStockOnly = params.inStockOnly
    const { limit: take, offset: skip } = params

    try {
      const whereClause: Prisma.ProductWhereInput = {}

      if (search && search.length > 0) {
        whereClause.name = { contains: search, mode: 'insensitive' }
      }

      if (categoriesId && categoriesId.length > 0) {
        whereClause.categoryId = { in: categoriesId }
      }

      if (unitiesId && unitiesId.length > 0) {
        whereClause.unityId = { in: unitiesId }
      }

      if (inStockOnly !== undefined) {
        whereClause.stock = { gte: 0 }
      }

      if (priceRange && priceRange.length === 2) {
        const [minPrice, maxPrice] = priceRange
        whereClause.OR = [
          { price: { gte: minPrice, lte: maxPrice } },
          {
            AND: [
              { secondPrice: { not: null } },
              { secondPrice: { not: 0 } },
              { secondPrice: { gte: minPrice, lte: maxPrice } },
            ],
          },
        ]
      }

      const [totalItems, objects] = await Promise.all([
        prisma.product.count({ where: whereClause }),
        prisma.product.findMany({
          where: whereClause,
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          include: { images: { orderBy: { displayOrder: 'asc' } } },
          take,
          skip,
        }),
      ])

      return { objects, totalItems }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Errror al intentar obtener los productos')
    }
  }

  static async create({ userId, data }: { userId: string; data: ProductCreateType }) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) throw new NotFoundError('Usuario no encontrado')
      const slug = await generateUniqueSlug(data.name)
      const total = await prisma.product.count()

      const newObject = await prisma.product.create({
        data: {
          slug,
          displayOrder: total + 1,
          name: data.name,
          description: data.description,
          price: data.price,
          secondPrice: data.secondPrice,
          stock: data.stock,
          freeShipping: data.freeShipping,
          videoId: data.videoId,
          user: { connect: { id: user.id } },
          category: { connect: { id: data.categoryId } },
          unity: { connect: { id: data.unityId } },
        },
        include: { images: true },
      })

      return newObject
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('El producto ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar crear el producto')
    }
  }

  static async update({ id, data }: { id: string; data: ProductUpdateType }) {
    const newData = getDataForUpdate(data)

    try {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) throw new NotFoundError('Producto no encontrado')

      if (newData.name) {
        newData.slug = await generateUniqueSlug(newData.name as string)
      }

      const updated = await prisma.product.update({
        where: { id },
        data: newData,
        include: { images: true },
      })
      return updated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar el producto')
    }
  }

  static async delete({ id }: { id: string }) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      })

      if (!product) throw new NotFoundError('Producto no encontrado')

      const deleted = await prisma.product.delete({
        where: { id },
      })
      await prisma.product.updateMany({
        where: {
          displayOrder: {
            gt: product.displayOrder,
          },
        },
        data: {
          displayOrder: {
            decrement: 1,
          },
        },
      })

      return deleted
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar eliminar el producto')
    }
  }

  static async updateOrder(updatedProducts: UpdateOrderParams[]) {
    try {
      const updateOperations = updatedProducts.map((product) =>
        prisma.product.update({
          where: { id: product.id },
          data: { displayOrder: product.displayOrder },
        }),
      )

      return await prisma.$transaction(updateOperations)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al actualizar el orden de los productos')
    }
  }

  static async updateSingleOrder({ id, displayOrder }: UpdateOrderParams) {
    try {
      return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id } })
        if (!product) throw new NotFoundError('Producto no encontrado')

        const newOrder = displayOrder
        const prevOrder = product.displayOrder

        if (newOrder === prevOrder) return

        if (newOrder < prevOrder) {
          // Mover hacia arriba: desplaza otros hacia abajo
          await tx.product.updateMany({
            where: {
              displayOrder: {
                gte: newOrder,
                lt: prevOrder,
              },
            },
            data: {
              displayOrder: {
                increment: 1,
              },
            },
          })
        } else {
          // Mover hacia abajo: desplaza otros hacia arriba
          await tx.product.updateMany({
            where: {
              displayOrder: {
                lte: newOrder,
                gt: prevOrder,
              },
            },
            data: {
              displayOrder: {
                decrement: 1,
              },
            },
          })
        }

        // Finalmente actualiza el producto
        await tx.product.update({
          where: { id },
          data: { displayOrder: newOrder },
        })
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al asignar nuevo orden manualmente')
    }
  }

  static async validateCart({ items }: { items: CartItem[] }) {
    try {
      const productIds = items.map((item) => item.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          images: true,
        },
      })

      const validatedItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId)

        if (!product) {
          return {
            ...item,
            valid: false,
            reason: 'Producto no disponible',
            availableStock: 0,
          }
        }

        if (product.stock < item.quantity) {
          return {
            ...item,
            valid: false,
            reason: `${product.name} Stock insuficiente`,
            availableStock: product.stock,
          }
        }

        return {
          ...item,
          valid: true,
          product: product,
        }
      })

      return validatedItems
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al validar los productos del carrito')
    }
  }
}
