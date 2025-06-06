import usersJson from '@/seed/json/users.json'
import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type UserType = {
  code: string
  first_name: string
  last_name: string
  email: string
  last_login: string
  is_staff: string
  is_superuser: string
  is_active: string
  date_joined: string
  // date_updated: string
  // user_permissions: string
  // username: string
  // image: string
  // country: string
  // phone: string
}

function generatePassword() {
  const raw = crypto.randomBytes(8).toString('hex').toUpperCase()
  return bcrypt.hash(raw, 10)
}

const toBool = (val: string) => val === '1'

async function registerUsers({ users }: { users: UserType[] }) {
  try {
    await Promise.all(
      users.map(async (user) => {
        await prisma.user.create({
          data: {
            id: user.code,
            name: user.first_name,
            lastName: user.last_name,
            email: user.email,
            isMod: toBool(user.is_staff),
            isActive: toBool(user.is_active),
            isAdmin: toBool(user.is_superuser),
            password: await generatePassword(),
            createdAt: new Date(user.date_joined),
            updatedAt: new Date(),
          },
        })
      }),
    )
    console.log('✅ Usuarios registrados correctamente.')
  } catch (error) {
    console.error('Error al registrar usuarios:', error)
  } finally {
    await prisma.$disconnect()
  }
}

registerUsers({ users: usersJson })
