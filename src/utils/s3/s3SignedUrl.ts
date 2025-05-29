import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from './s3Uploader' // importa tu instancia de S3Client
import { config } from '@/config'

const { AWS_STORAGE_BUCKET_NAME } = config

export const getSignedImageUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: AWS_STORAGE_BUCKET_NAME,
    Key: key,
  })

  // Expira en 5 minutos
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })
  return signedUrl
}
