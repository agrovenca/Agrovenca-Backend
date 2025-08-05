import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://1rzr331r-5173.use.devtunnels.ms',
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (acceptedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    exposedHeaders: ['Content-Disposition'],
  })
