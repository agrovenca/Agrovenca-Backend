import { Request } from 'express'

export const getCommonQueryFilters = (reqQuery: Request['query']) => {
  const page = Math.max(Number(reqQuery.page) || 1, 1)
  const rawLimit = Number(reqQuery.limit)
  const limit = rawLimit === 0 ? 0 : Math.max(rawLimit || 12, 1)
  const search = reqQuery.search?.toString() || ''
  return { page, limit, search }
}
