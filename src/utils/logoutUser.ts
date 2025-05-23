import { Request, Response } from 'express'
import { config } from '@/config'

const { COOKIE_OPTIONS } = config

export const logoutUser = (_req: Request, res: Response, message: string = 'Logout successful') => {
  res
    .clearCookie('access_token', COOKIE_OPTIONS)
    .clearCookie('refresh_token', COOKIE_OPTIONS)
    .json({ message })
}
