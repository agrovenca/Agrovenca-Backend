import { Prisma, PrismaClient } from '@prisma/client'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { ProductCreateType } from '@/schemas/settings/products'
import slugify from 'slugify'

const prisma = new PrismaClient()

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
}
