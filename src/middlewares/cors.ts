import cors from 'cors'

const ACCEPTED_ORIGINS = ['http://localhost:5173', 'https://agrovenca.com']

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
