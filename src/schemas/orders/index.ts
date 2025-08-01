import { z } from 'zod'

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

export type OrderCreateType = z.infer<typeof OrderCreateSchema>
export type OrderUpdateType = z.infer<typeof OrderUpdateSchema>

export const validateOrderCreate = (order: OrderCreateType) => {
  return OrderCreateSchema.safeParse(order)
}
