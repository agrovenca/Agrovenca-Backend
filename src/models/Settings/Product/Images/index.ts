import { Prisma, PrismaClient } from '@prisma/client'
import { AppError, ConflictError, NotFoundError, ServerError } from '@/utils/errors'
import { ImageCreateType } from '@/schemas/settings/images'
import { MulterS3File } from '@/types/shared'

const prisma = new PrismaClient()

export class ProductImagesModel {
  static async getImagesByProduct({ productId }: { productId: string }) {
    try {
      const objects = await prisma.image.findMany({
        where: { productId },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      })

      return objects
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Errror al intentar obtener las imagenes')
    }
  }

  static async create({ productId, data }: { productId: string; data: ImageCreateType }) {
    try {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      const { files } = data
      if (!product) throw new NotFoundError('Producto no encontrado')
      const imagesCount = await prisma.image.count({
        where: { productId: product.id },
      })

      // 'https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg'

      await prisma.image.createMany({
        data: files.map((file: MulterS3File, idx: number) => {
          return {
            url: file.location,
            displayOrder: imagesCount + idx + 1,
            productId: product.id,
          }
        }),
      })

      return await prisma.image.findMany({ where: { productId } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError('La imagen ya existe')
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar registrar la imagen')
    }
  }

  // * TODO
  static async updateOrder(updatedImages: { id: string; displayOrder: number }[]) {
    try {
      const updateOperations = updatedImages.map((product) =>
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
}
