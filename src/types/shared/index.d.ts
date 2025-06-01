export interface BaseFilterParams {
  offset?: number
  search?: string
  limit?: number
}

interface MulterS3File extends Express.Multer.File {
  location: string // URL del archivo en S3
  key: string // Ruta/clave del archivo en S3
}
