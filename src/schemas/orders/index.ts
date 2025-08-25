import { z } from 'zod'

const MAX_FILE_SIZE = 1024 * 1024 * 5
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export const OrderCreateSchema = z.object({
  id: z.string().regex(/^ORD-\d{20}$/),
  couponId: z.string().optional(),
  shippingAddressId: z.string().uuid(),
  products: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      price: z.number().positive(),
      categoryId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ),
  subtotal: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().positive(),
})

export const OrderUpdateSchema = OrderCreateSchema.partial().omit({
  id: true,
  couponId: true,
  products: true,
  subtotal: true,
  discount: true,
  tax: true,
  total: true,
})

export const RegisterPaymentSchema = z.object({
  receipt: z.object({
    mimetype: z.string().refine((type) => ACCEPTED_IMAGE_MIME_TYPES.includes(type), {
      message: 'Solo los formatos .jpg, .jpeg y .png están permitidos.',
    }),
    size: z.number().max(MAX_FILE_SIZE, { message: 'La imagen debe ser de 5MB o menos' }),
    key: z.string(),
    originalname: z.string(),
    location: z.string(),
  }),
})

export type OrderCreateType = z.infer<typeof OrderCreateSchema>
export type OrderUpdateType = z.infer<typeof OrderUpdateSchema>
export type RegisterPaymentType = z.infer<typeof RegisterPaymentSchema>

export const validateOrderCreate = (order: OrderCreateType) => {
  return OrderCreateSchema.safeParse(order)
}

export const validatePaymentCreate = (data: RegisterPaymentType) => {
  return RegisterPaymentSchema.safeParse(data)
}
