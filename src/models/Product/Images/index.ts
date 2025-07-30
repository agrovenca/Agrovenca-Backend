import { Prisma, PrismaClient } from '@prisma/client'
import {
  AppError,
  ConflictError,
  NotFoundError,
  ServerError,
  ValidationError,
} from '@/utils/errors'
import { ImageCreateType } from '@/schemas/images'
import { MulterS3File } from '@/types/shared'
import { config } from '@/config'
import { pluralize } from '@/utils/pluralize'
import { deleteS3Images } from '@/utils/s3/s3DeleteImages'

const prisma = new PrismaClient()
const PRODUCT_IMAGE_LIMIT = 5
const { AWS_STORAGE_BUCKET_NAME } = config

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
        const availableSpaces = PRODUCT_IMAGE_LIMIT - imagesCount

        // Eliminar archivos recién subidos al exceder el límite
        const imagesToDelete = files.map((file) => ({ id: file.key, s3Key: file.key }))
        await deleteS3Images({ images: imagesToDelete, bucket: AWS_STORAGE_BUCKET_NAME })

        const message =
          availableSpaces === 0
            ? `Alcanzaste el límite de ${PRODUCT_IMAGE_LIMIT} imágenes por producto`
            : `Solo puedes subir ${availableSpaces} ${pluralize('im', availableSpaces, 'ágenes', 'agen')} más antes de alcanzar el límite de ${PRODUCT_IMAGE_LIMIT}`

        throw new ValidationError(message)
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
      return images
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictError(
            'Una o varias imágenes ya existen. Elimina las duplicadas e intenta de nuevo.',
          )
        }
      }
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar registrar la imagen')
    }
  }

  static async updateOrder(
    productId: string,
    updatedImages: { id: string; productId: string; displayOrder: number }[],
  ) {
    try {
      const updateOperations = updatedImages.map((image) =>
        prisma.image.update({
          where: { id: image.id, productId },
          data: { displayOrder: image.displayOrder },
        }),
      )

      return await prisma.$transaction(updateOperations)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al actualizar el orden de las imágenes')
    }
  }

  static async delete({ imageId, productId }: { imageId: string; productId: string }) {
    try {
      // 1. Obtener solo la información necesaria: displayOrder
      const image = await prisma.image.findUnique({
        where: { id: imageId },
        select: { id: true, productId: true, s3Key: true, displayOrder: true },
      })

      if (!image || image.productId !== productId) {
        throw new NotFoundError('Imagen no encontrada')
      }

      // 2. Eliminar en paralelo el objeto de S3 y la imagen de la base de datos
      const deleteS3Promise = deleteS3Images({ images: [image], bucket: AWS_STORAGE_BUCKET_NAME })

      const deleteImagePromise = prisma.image.delete({
        where: { id: imageId },
      })

      await Promise.all([deleteS3Promise, deleteImagePromise])

      // 3. Actualizar el orden y obtener las imágenes en una sola transacción
      const updatedImages = await prisma.$transaction([
        prisma.image.updateMany({
          where: {
            productId: productId,
            displayOrder: { gt: image.displayOrder },
          },
          data: {
            displayOrder: { decrement: 1 },
          },
        }),
        prisma.image.findMany({
          where: { productId },
          orderBy: { displayOrder: 'asc' },
        }),
      ])

      return updatedImages[1]
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar eliminar la imagen.')
    }
  }
}
