import nodemailer from 'nodemailer'
import { config } from '@/config'

const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_SECURE } = config

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: EMAIL_SECURE === 'true',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
})
