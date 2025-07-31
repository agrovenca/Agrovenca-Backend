import { config } from '@/config'
import { transporter } from '@/utils/mailer'

const { EMAIL_FROM } = config

interface Props {
  toEmail: string
  subject: string
  html: string
}

export const sendUserEmail = async ({ toEmail, subject, html }: Props) => {
  try {
    await transporter.sendMail({
      html,
      subject,
      to: toEmail,
      from: `Agrovenca <${EMAIL_FROM}>`,
    })
  } catch (_error) {
    return
  }
}
