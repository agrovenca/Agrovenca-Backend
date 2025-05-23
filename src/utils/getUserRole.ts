import { User } from '@prisma/client'

export const getUserRole = async (user: Omit<User, 'password'>) => {
  try {
    if (user.isAdmin) {
      return 'admin'
    }
    if (user.isMod) {
      return 'mod'
    }
    return 'user'
  } catch (_error) {
    throw new Error('Error getting user role')
  }
}
