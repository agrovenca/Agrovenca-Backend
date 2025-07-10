import multer from 'multer'
import multerS3 from 'multer-s3'
import { S3Client } from '@aws-sdk/client-s3'
import { getProductImageS3Key } from './s3UploadPath'
import { PrismaClient } from '@prisma/client'
import { config } from '@/config'

const prisma = new PrismaClient()
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_REGION_NAME,
  AWS_STORAGE_BUCKET_NAME,
  AWS_S3_ENDPOINT_URL,
} = config

export const s3 = new S3Client({
  region: AWS_S3_REGION_NAME,
  endpoint: `https://${AWS_S3_REGION_NAME}.${AWS_S3_ENDPOINT_URL}`,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
})

export const getMulterS3Upload = (productId: string) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: AWS_STORAGE_BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: async (_req, file, cb) => {
        try {
          const product = await prisma.product.findUnique({ where: { id: productId } })
          if (!product || !product.slug) return cb(new Error('Producto no encontrado'), '')

          const key = getProductImageS3Key(product.slug, file.originalname)
          cb(null, key)
        } catch (err) {
          cb(err as Error, '')
        }
      },
    }),
  })
}
