import productsJson from '@/seed/json/products.json'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Product = {
  code: string
  slug: string
  name: string
  description: string
  price: string
  compare_price: string
  stock: string
  free_shipping: string
  video_link: string
  created_at: string
  updated_at: string
  number: string

  user: string
  category: string
  unity: string
}

function parseCommaDecimalSafe(str: string) {
  const cleaned = str
    .trim()
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
  return parseFloat(cleaned)
}

const toBool = (val: string) => val === '1'

async function registerProducts({ products }: { products: Product[] }) {
  try {
    await Promise.all(
      products.map(async (product) => {
        await prisma.product.create({
          data: {
            id: product.code,
            slug: product.slug,
            name: product.name,
            description: product.description,
            price: parseCommaDecimalSafe(product.price),
            secondPrice: parseCommaDecimalSafe(product.compare_price),
            stock: Number(product.stock),
            freeShipping: toBool(product.free_shipping),
            createdAt: new Date(product.created_at),
            updatedAt: new Date(product.updated_at),
            displayOrder: Number(product.number),
            user: { connect: { id: product.user } },
            category: { connect: { id: product.category } },
            unity: { connect: { id: product.unity } },
          },
        })
      }),
    )
    console.log('✅ Productos registrados correctamente.')
  } catch (error) {
    console.error('Error al registrar productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

registerProducts({ products: productsJson })
