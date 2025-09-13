import dotenv from 'dotenv'

dotenv.config()

interface Config {
  PORT: string | number
  SALT_ROUNDS: number
  SECRET_JWT_KEY: string
  SECRET_REFRESH_KEY: string
  COOKIE_OPTIONS: {
    httpOnly: boolean
    sameSite: boolean | 'lax' | 'none' | 'strict' | undefined
    secure: boolean
  }
  ITEMS_PER_PAGE: number
  EMAIL_FROM: string
  EMAIL_USER: string
  EMAIL_PASSWORD: string
  EMAIL_SECURE: string
  EMAIL_HOST: string
  EMAIL_PORT: string
  FRONTEND_URL: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_STORAGE_BUCKET_NAME: string
  AWS_S3_REGION_NAME: string
  AWS_S3_ENDPOINT_URL: string
}

export const config: Config = {
  PORT: process.env.PORT || 3000,
  SALT_ROUNDS: 10,
  SECRET_JWT_KEY: process.env.SECRET_JWT_KEY as string,
  SECRET_REFRESH_KEY: process.env.SECRET_REFRESH_KEY as string,
  COOKIE_OPTIONS: {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  },
  ITEMS_PER_PAGE: Number(process.env.ITEMS_PER_PAGE) || 10,
  EMAIL_FROM: process.env.EMAIL_FROM as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  EMAIL_SECURE: process.env.EMAIL_SECURE as string,
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: process.env.EMAIL_PORT as string,
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_STORAGE_BUCKET_NAME: process.env.AWS_STORAGE_BUCKET_NAME as string,
  AWS_S3_REGION_NAME: process.env.AWS_S3_REGION_NAME as string,
  AWS_S3_ENDPOINT_URL: process.env.AWS_S3_ENDPOINT_URL as string,
}
