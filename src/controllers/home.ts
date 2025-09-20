import { Request, Response } from 'express'
import { validateContactMessage } from '@/schemas/contacts'
import { handleErrors } from './handleErrors'
import { transporter } from '@/utils/mailer'
import ejs from 'ejs'
import { resolveTemplatePath } from '@/utils/resolveTemplatePath'
import { config } from '@/config'

const { EMAIL_FROM, TURNSTILE_SECRET_KEY } = config

export class HomeController {
  sendMessage = async (req: Request, res: Response) => {
    const { captchaToken } = req.body

    if (!captchaToken) {
      res.status(400).json({ success: false, message: 'Captcha es requerido' })
      return
    }

    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: TURNSTILE_SECRET_KEY,
          response: captchaToken,
        }),
      })

      const outcome = await verifyRes.json()

      if (!outcome.success) {
        res.status(400).json({ success: false, message: 'Captcha inválido' })
        return
      }

      const result = validateContactMessage(req.body)

      if (!result.success || !result.data) {
        res.status(400).json({ error: JSON.parse(result.error.message) })
        return
      }

      const templatePath = resolveTemplatePath('templates/email-contact.ejs')

      const html = await ejs.renderFile(templatePath, {
        userFullname: result.data.fullname,
        userEmail: result.data.email,
        userPhone: result.data.phone,
        userMessage: result.data.message,
        currentYear: new Date().getFullYear(),
      })

      await transporter.sendMail({
        html,
        to: EMAIL_FROM,
        replyTo: result.data.email,
        from: `Agrovenca <${EMAIL_FROM}>`,
        subject: 'Nuevo mensaje de contacto',
      })

      res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' })
    } catch (error) {
      handleErrors({ error, res })
    }
  }
}
