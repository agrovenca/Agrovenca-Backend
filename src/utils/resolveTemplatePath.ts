import path from 'path'

export const resolveTemplatePath = (relativePath: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? 'build' : 'src'
  return path.join(process.cwd(), basePath, relativePath)
}
