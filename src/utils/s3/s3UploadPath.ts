export function getProductImageS3Key(productSlug: string, filename: string) {
  const key = `media/Product/${productSlug}/Images/${filename}`
  return key
}
