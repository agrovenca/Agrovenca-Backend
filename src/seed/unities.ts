import unitiesJson from '@/seed/json/unities.json'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Unity = {
  code: string
  name: string
  description: string
  created_at: string
}

async function registerUnities({ unities }: { unities: Unity[] }) {
  try {
    await prisma.unity.deleteMany()
    await Promise.all(
      unities.map(async (unity) => {
        await prisma.unity.create({
          data: {
            id: unity.code,
            name: unity.name,
            description: unity.description,
            createdAt: new Date(unity.created_at),
            updatedAt: new Date(),
          },
        })
      }),
    )
    console.log('✅ Unidades registradas correctamente.')
  } catch (error) {
    console.error('❌ Error al registrar las unidades:', error)
  } finally {
    await prisma.$disconnect()
  }
}

registerUnities({ unities: unitiesJson })
