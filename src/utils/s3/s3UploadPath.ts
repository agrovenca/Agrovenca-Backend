export function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD') // elimina tildes
    .replace(/[\u0300-\u036f]/g, '') // elimina los caracteres diacríticos
    .replace(/[^a-zA-Z0-9\s-]/g, '') // elimina caracteres especiales
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // espacios -> guiones
    .replace(/-+/g, '-') // múltiples guiones -> uno solo
}

export function getProductImageS3Key(productSlug: string, filename: string) {
  const ext = filename.split('.').pop()
  const baseName = filename.replace(/\.[^/.]+$/, '')
  const safeName = slugify(baseName)

  const key = `media/Product/${productSlug}/Images/${safeName}.${ext}`
  return key
}
