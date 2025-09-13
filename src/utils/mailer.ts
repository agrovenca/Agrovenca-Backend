import nodemailer from 'nodemailer'
import { config } from '@/config'

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_SECURE } = config

export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  secure: EMAIL_SECURE === 'true',
  port: Number(EMAIL_PORT),
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
})
