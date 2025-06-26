import express from 'express'
import { config } from './config'
import { corsMiddleware } from './middlewares/cors'
import cookieParser from 'cookie-parser'
import { createUserRouter } from './routes/users'
import { createAuthRouter } from './routes/auth'
import { authMiddleware } from './middlewares/auth'
import { productsRouter } from './routes/products'
import { categoriesRouter } from './routes/categories'
import { couponsRouter } from './routes/coupons'
import { unitiesRouter } from './routes/unities'
import { shippingRouter } from './routes/shipping'

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

app.use('/api/categories', categoriesRouter())
app.use('/api/coupons', couponsRouter())
app.use('/api/unities', unitiesRouter())
app.use('/api/products', productsRouter())
app.use('/api/shippings', shippingRouter())

app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Not Found' })
  return
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
