import { z } from 'zod'

export const ContactSchema = z.object({
  fullname: z.string().min(2, { message: 'Nombre completo es requerido' }).max(180),
  message: z.string().max(800).min(10, { message: 'Mensaje es requerido' }),
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, {
    message: 'Número de teléfono inválido. Use formato internacional, ej: +593987654321',
  }),
})

export type Contact = z.infer<typeof ContactSchema>

export const validateContactMessage = (data: Contact) => {
  return ContactSchema.safeParse(data)
}
