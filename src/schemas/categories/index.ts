import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
})

export type Category = z.infer<typeof categorySchema>

export const validateCategory = (category: Category) => {
  return categorySchema.safeParse(category)
}
