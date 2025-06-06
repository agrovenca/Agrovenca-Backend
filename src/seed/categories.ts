import categoriesJson from '@/seed/json/categories.json'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Category = {
  code: string
  name: string
  description: string
  user: string
  active: string
  created_at: string
}

const toBool = (val: string) => val === '1'

async function registerCategories({ categories }: { categories: Category[] }) {
  try {
    await Promise.all(
      categories.map(async (category) => {
        await prisma.category.create({
          data: {
            id: category.code,
            name: category.name,
            description: category.description,
            active: toBool(category.active),
            createdAt: new Date(category.created_at),
            user: { connect: { id: category.user } },
          },
        })
      }),
    )
    console.log('✅ Categorías registradas correctamente.')
  } catch (error) {
    console.error('Error al registrar las categorías:', error)
  } finally {
    await prisma.$disconnect()
  }
}

registerCategories({ categories: categoriesJson })
