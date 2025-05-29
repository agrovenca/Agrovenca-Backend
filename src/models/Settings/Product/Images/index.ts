import { Prisma, PrismaClient } from '@prisma/client'
import {
  AppError,
  ConflictError,
  NotFoundError,
  ServerError,
  ValidationError,
} from '@/utils/errors'
import { ImageCreateType } from '@/schemas/settings/images'
import { MulterS3File } from '@/types/shared'
import { getSignedImageUrl } from '@/utils/s3/s3SignedUrl'

const prisma = new PrismaClient()
const PRODUCT_IMAGE_LIMIT = 5

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
      const { files }: { files?: MulterS3File[] } = data
      if (!product) throw new NotFoundError('Producto no encontrado')
      if (!files) throw new NotFoundError('Debes subir al menos una imagen.')

      const imagesCount = await prisma.image.count({
        where: { productId: product.id },
      })
      if (imagesCount + files.length > PRODUCT_IMAGE_LIMIT) {
        throw new ValidationError(
          imagesCount > PRODUCT_IMAGE_LIMIT
            ? `Alcanzaste el límite de ${PRODUCT_IMAGE_LIMIT} imágenes por producto`
            : `Solo puedes subir ${PRODUCT_IMAGE_LIMIT - imagesCount} imágenes más antes de alcanzar el límite de ${PRODUCT_IMAGE_LIMIT}`,
        )
      }

      await prisma.image.createMany({
        data: files.map((file, idx: number) => {
          return {
            s3Key: file.key,
            displayOrder: imagesCount + idx + 1,
            productId: product.id,
          }
        }),
      })

      const images = await prisma.image.findMany({ where: { productId } })
      const imagesWithSignedUrls = await Promise.all(
        images.map(async (img) => ({
          ...img,
          s3Key: await getSignedImageUrl(img.s3Key),
        })),
      )
      return imagesWithSignedUrls
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

  static async updateOrder(
    updatedImages: { id: string; productId: string; displayOrder: number }[],
  ) {
    try {
      const updateOperations = updatedImages.map((image) =>
        prisma.image.update({
          where: { id: image.id, productId: image.productId },
          data: { displayOrder: image.displayOrder },
        }),
      )

      return await prisma.$transaction(updateOperations)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al actualizar el orden de las imágenes')
    }
  }
}
