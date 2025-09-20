import { Router } from 'express'
import { HomeController } from '@/controllers/home'

export const contactRouter = () => {
  const router = Router()
  const controller = new HomeController()

  router.post('/send-message', controller.sendMessage)

  return router
}
