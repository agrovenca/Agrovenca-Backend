import { AppError } from '@/utils/errors'
import { Response } from 'express'

export const handleErrors = ({ error, res }: { error: unknown; res: Response }) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message })
    return
  }
  res.status(500).json({ error: 'Internal server error' })
  return
}
