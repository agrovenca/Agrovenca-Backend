import { NextFunction, Request, Response } from 'express'

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] ERROR en ${req.method} ${req.url}:`, err)
  res.status(500).json({ error: 'Internal Server Error' })
}
