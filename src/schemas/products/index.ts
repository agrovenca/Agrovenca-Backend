import { z } from 'zod'

export const ProductCreateSchema = z.object({
  name: z.string().min(2).max(255),
  description: z
    .string()
    .min(2, { message: 'Mínimo 2 caractéres' })
    .max(800, { message: 'Máximo 800 caractéres' }),
  price: z.number(),
  secondPrice: z.number().optional().default(0.0),
  stock: z.number().default(1),
  freeShipping: z.boolean(),
  videoId: z.union([z.string(), z.null()]).optional(),

  categoryId: z.string().uuid(),
  unityId: z.string().uuid(),
})

export const ProductUpdateSchema = ProductCreateSchema.partial()

export type ProductCreateType = z.infer<typeof ProductCreateSchema>
export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>

export const validateProductCreate = (product: ProductCreateType) => {
  return ProductCreateSchema.safeParse(product)
}

export const validateProductUpdate = (product: ProductUpdateType) => {
  return ProductUpdateSchema.partial().safeParse(product)
}
