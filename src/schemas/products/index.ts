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

export const ChangePricesSchema = z.object({
  percentage: z
    .number({
      required_error: 'El porcentaje es requerido',
      invalid_type_error: 'El porcentaje debe ser un número',
    })
    .gt(0, { message: 'El porcentaje debe ser mayor a 0' }),
  increment: z.boolean({
    required_error: 'El campo increment es requerido',
    invalid_type_error: 'El campo increment debe ser true o false',
  }),
})

export type ProductCreateType = z.infer<typeof ProductCreateSchema>
export type ProductUpdateType = z.infer<typeof ProductUpdateSchema>
export type ChangePricesType = z.infer<typeof ChangePricesSchema>

export const validateProductCreate = (product: ProductCreateType) => {
  return ProductCreateSchema.safeParse(product)
}

export const validateProductUpdate = (product: ProductUpdateType) => {
  return ProductUpdateSchema.partial().safeParse(product)
}

export const validateChangePrices = (data: ChangePricesType) => {
  return ChangePricesSchema.safeParse(data)
}
