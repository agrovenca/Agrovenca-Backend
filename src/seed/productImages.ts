import productImagesJson from '@/seed/json/productImages.json'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

type ProductImage = {
  code: string
  image: string
  product: string
  created_at: string
}

async function registerProductImages({ productImages }: { productImages: ProductImage[] }) {
  try {
    await Promise.all(
      productImages.map(async (image) => {
        try {
          const count = await prisma.image.count({ where: { productId: image.product } })
          await prisma.image.create({
            data: {
              id: image.code,
              s3Key: `media/${image.image}`,
              displayOrder: count + 1,
              createdAt: new Date(image.created_at),
              product: { connect: { id: image.product } },
            },
          })
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            console.warn(`⚠️ Imagen con ID "${image.code}" ya existe. Se omitió.`)
          } else {
            console.error(`❌ Error al registrar imagen "${image.code}":`, error)
          }
        }
      }),
    )

    console.log('✅ Registro de imágenes completado.')
  } catch (error) {
    console.error('🚨 Error general durante el registro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

registerProductImages({ productImages: productImagesJson })
