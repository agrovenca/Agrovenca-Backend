import { z } from 'zod'

export const CouponSchema = z.object({
  code: z.string().min(2, { message: 'Código es requerido' }).max(50),
  description: z.string().max(255).optional(),
  discount: z.number().min(0, { message: 'Descuento no puede ser menor a 0' }),
  active: z.boolean(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  usageLimit: z.number().optional(),
  timesUsed: z.number().default(0).optional(),
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
