import { z } from 'zod'

export const CouponSchema = z.object({
  code: z.string().min(2, { message: 'Código es requerido' }).max(50),
  description: z.string().max(255).optional(),
  discount: z.number().min(0, { message: 'Descuento no puede ser menor a 0' }),
  active: z.boolean(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  usageLimit: z.number().optional(),
  timesUsed: z.number().default(0).optional(),
  minPurchase: z.coerce.number().gte(0, { message: 'No puede ser menor que 0' }).optional(),
  validCategories: z
    .array(z.string())
    .max(10, { message: 'No pueden ser más de 10 categorías' })
    .optional(),
  expiresAt: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
})

export const CouponUpdateSchema = CouponSchema.omit({ code: true })

export type CouponType = z.infer<typeof CouponSchema>
export type CouponUpdateType = z.infer<typeof CouponUpdateSchema>

export const validateCoupon = (coupon: CouponType) => {
  return CouponSchema.safeParse(coupon)
}

export const validatePartialCoupon = (coupon: CouponUpdateType) => {
  return CouponUpdateSchema.partial().safeParse(coupon)
}
