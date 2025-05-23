import { UserChangePassword, UserUpdate } from '@/schemas/user'
import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { config } from '@/config'
import { getDataForUpdate } from '@/utils/getDataForUpdate'
import { AppError, NotFoundError, ServerError, ValidationError } from '@/utils/errors'
import { UserAccountSetting } from '@/schemas/settings/users'

const prisma = new PrismaClient()
const { SALT_ROUNDS, ITEMS_PER_PAGE } = config

export class UserModel {
  static async getAll(params?: { page?: number; search?: string }) {
    const page = params?.page ?? 1
    const search = params?.search ?? ''
    const take = ITEMS_PER_PAGE
    const skip = (page - 1) * ITEMS_PER_PAGE

    try {
      const whereClause: Prisma.UserWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}

      const [totalItems, objects] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
          where: whereClause,
          omit: { password: true },
          orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
          take,
          skip,
        }),
      ])

      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

      return { objects, totalItems, totalPages }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Errror al intentar obtener los usuarios')
    }
  }

  static async getById({ id }: { id: string }) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
        omit: {
          password: true,
        },
      })
      if (!user) throw new NotFoundError('Usuario no encontrado')
      return user
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar obtener el usuario')
    }
  }

  static async update({ id, data }: { id: string; data: Partial<UserUpdate> }) {
    const newData = getDataForUpdate(data)

    try {
      const user = await prisma.user.update({
        where: { id: id },
        data: newData,
        omit: { password: true },
      })
      return user
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new ServerError('Error al intentar actualizar el usuario')
    }
  }

  static async changePassword({ id, data }: { id: string; data: UserChangePassword }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })
      if (!user) throw new NotFoundError('Usuario no encontrado')

      const isValidPassword = await bcrypt.compare(data.currentPassword, user.password)
      if (!isValidPassword) throw new ValidationError('Contraseña incorrecta')

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
      const userChanged = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
        omit: { password: true },
      })

      return userChanged
    } catch (error) {
      if (error instanceof AppError) throw error

      throw new ServerError('Error al intenatar cambiar la contraseña')
    }
  }

  static async changeAccountOptions({
    userId,
    data,
  }: {
    userId: string
    data: UserAccountSetting
  }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (!user) throw new NotFoundError('Usuario no encontrado')

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          isActive: data.isActive,
          isMod: data.role === 'mod',
        },
        omit: { password: true },
      })

      return updated
    } catch (error) {
      if (error instanceof AppError) throw error

      throw new ServerError('Error al intentar cambiar la cuenta')
    }
  }
}
