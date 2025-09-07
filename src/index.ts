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
import { ordersRouter } from './routes/orders'
import { loggerMiddleware } from './middlewares/logger'
import { errorHandler } from './middlewares/errorHandler'

const { PORT } = config

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(corsMiddleware())
app.use(cookieParser())
app.use((req, res, next) => authMiddleware(req, res, next))

app.use(loggerMiddleware)

app.get('/', (_req, res) => {
  res.send('🚀 Yuju the API successfully running!')
})

app.use('/auth', createAuthRouter())
app.use('/users', createUserRouter())

app.use('/categories', categoriesRouter())
app.use('/coupons', couponsRouter())
app.use('/unities', unitiesRouter())
app.use('/products', productsRouter())
app.use('/shippings', shippingRouter())
app.use('/orders', ordersRouter())

app.use(errorHandler)

app.use((_req, res, _next) => {
  res.status(404).json({ error: 'Not Found' })
  return
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
