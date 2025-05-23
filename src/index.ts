import express from 'express'
import { config } from './config'
import { corsMiddleware } from './middlewares/cors'
import cookieParser from 'cookie-parser'
import { createUserRouter } from './routes/users'
import { createAuthRouter } from './routes/auth'
import { authMiddleware } from './middlewares/auth'
import { settingsRouter } from './routes/settings'

const { PORT } = config

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(corsMiddleware())
app.use(cookieParser())
app.use((req, res, next) => authMiddleware(req, res, next))

app.get('/', (_req, res) => {
  res.send('Hello World!')
})

app.use('/api/auth', createAuthRouter())
app.use('/api/users', createUserRouter())
app.use('/api/settings', settingsRouter())

app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Not Found' })
  return
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
