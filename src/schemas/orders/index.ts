import { z } from 'zod'

/**
 Request Body example for creating an order:
 {
  id: 'ORD-20250707183547475003',
  couponCode: 'THEJUNIOR777',
  shippingAddressId: '3cb0aa02-76bc-4e36-8106-fe888cb631ee',
  products: [
    {
      id: 'cdd21c8e-aad0-4c08-b50f-9e1940738590',
      quantity: 2,
      price: 1.5,
      categoryId: '336637b8-db87-44a9-af10-8b91d2014120'
    },
    {
      id: '4e0be9d7-2eec-40ca-9f9d-a7d77b7c8ca4',
      quantity: 2,
      price: 0.7,
      categoryId: '7f06025d-98d3-4bbd-8c48-74d4df92f317'
    },
    {
      id: '22f7026f-e92e-423c-8958-041dc41c055d',
      quantity: 6,
      price: 35,
      categoryId: '80f2388d-35a5-41eb-a6e9-97debc85d762'
    }
  ],
  subtotal: 192.96,
  discount: 21.44,
  tax: 23.16,
  total: 216.12
}
 */

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
