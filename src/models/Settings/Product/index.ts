import { Prisma, PrismaClient } from '@prisma/client'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { ProductCreateType, ProductUpdateType } from '@/schemas/settings/products'
import slugify from 'slugify'
import { config } from '@/config'
import { getDataForUpdate } from '@/utils/getDataForUpdate'

const prisma = new PrismaClient()
const { ITEMS_PER_PAGE } = config

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
  static async getAll(params?: { page?: number; search?: string }) {
    const page = params?.page ?? 1
    const search = params?.search ?? ''
    const take = ITEMS_PER_PAGE
    const skip = (page - 1) * ITEMS_PER_PAGE

    try {
      const whereClause: Prisma.ProductWhereInput = search
        ? {
            OR: [{ name: { contains: search, mode: 'insensitive' } }],
          }
        : {}

      const [totalItems, objects] = await Promise.all([
        prisma.product.count({ where: whereClause }),
        prisma.product.findMany({
          where: whereClause,
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          take,
          skip,
        }),
      ])

      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

      return { objects, totalItems, totalPages }
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
      })
      return updated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar el producto')
    }
  }
}
