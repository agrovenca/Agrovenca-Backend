import { config } from '../config'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const { SECRET_JWT_KEY, SECRET_REFRESH_KEY, COOKIE_OPTIONS } = config
const prisma = new PrismaClient()
type dataToEncrypt = { id: string; email: string; role: string } | null

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token
  const refreshToken = req.cookies.refresh_token

  let data: dataToEncrypt = null

  try {
    data = jwt.verify(token, SECRET_JWT_KEY) as dataToEncrypt
    req.user = data
    return next()
  } catch (error) {
    if ((error instanceof jwt.TokenExpiredError || jwt.JsonWebTokenError) && refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, SECRET_REFRESH_KEY) as dataToEncrypt
        const newAccessToken = jwt.sign(
          { id: payload?.id, email: payload?.email, role: payload?.role },
          SECRET_JWT_KEY,
          { expiresIn: '1d' },
        )

        res.cookie('access_token', newAccessToken, {
          ...COOKIE_OPTIONS,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        })

        req.user = payload
      } catch (_refreshError) {
        // refresh token inválido o expirado
        req.user = null
      }
    } else {
      req.user = null
    }
  }
  next()
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

export const requireRole = async (req: Request, res: Response, next: NextFunction) => {
  const { user: currentUser } = req

  if (!currentUser) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: currentUser?.id } })
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (user.isAdmin || user.isMod) {
      return next()
    }

    res.status(403).json({ error: 'Forbidden' })
  } catch (_error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
