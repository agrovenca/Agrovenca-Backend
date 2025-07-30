import { s3 } from '@/utils/s3/s3Uploader'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

type Image = {
  id: string
  s3Key: string
}

export async function deleteS3Images({ images, bucket }: { images: Image[]; bucket: string }) {
  if (!images.length) return

  // Eliminar de S3
  const deleteS3Promises = images.map((image) =>
    s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: image.s3Key,
      }),
    ),
  )

  await Promise.all(deleteS3Promises)
}
