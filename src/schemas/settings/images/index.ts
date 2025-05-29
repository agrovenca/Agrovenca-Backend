import { z } from 'zod'

const MAX_FILE_SIZE = 1024 * 1024 * 5

export const ImageCreateSchema = z.object({
  files: z
    .any()
    .refine(
      (files) => files.every((file: File) => file.size <= MAX_FILE_SIZE),
      'La imagen debe ser de 5MB o menos',
    ),
})

export type ImageCreateType = z.infer<typeof ImageCreateSchema>

export const validateImageCreate = (images: ImageCreateType) => {
  return ImageCreateSchema.safeParse(images)
}
