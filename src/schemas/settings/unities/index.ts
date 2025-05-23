import { z } from 'zod'

export const unitySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
})

export type Unity = z.infer<typeof unitySchema>

export const validateUnity = (unity: Unity) => {
  return unitySchema.safeParse(unity)
}
