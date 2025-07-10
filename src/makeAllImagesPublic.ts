import { ListObjectsV2Command, PutObjectAclCommand } from '@aws-sdk/client-s3'
import { config } from '@/config'
import { s3 } from '@/utils/s3/s3Uploader'

const { AWS_STORAGE_BUCKET_NAME } = config

const prefix = 'media/Product/'

const makeAllImagesPublic = async () => {
  try {
    // Paso 1: Listar objetos
    const listCommand = new ListObjectsV2Command({
      Bucket: AWS_STORAGE_BUCKET_NAME,
      Prefix: prefix,
    })

    const response = await s3.send(listCommand)

    if (!response.Contents || response.Contents.length === 0) {
      console.log('No se encontraron archivos.')
      return
    }

    // Paso 2: Hacer cada archivo público
    for (const obj of response.Contents) {
      if (obj.Key) {
        const aclCommand = new PutObjectAclCommand({
          Bucket: AWS_STORAGE_BUCKET_NAME,
          Key: obj.Key,
          ACL: 'public-read',
        })

        await s3.send(aclCommand)
        console.log(`✔ Hecho público: ${obj.Key}`)
      }
    }

    console.log('✅ Todos los archivos fueron actualizados.')
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

makeAllImagesPublic()
