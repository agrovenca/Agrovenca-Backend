import { Request } from 'express'

export const getCommonQueryFilters = (reqQuery: Request['query']) => {
  const page = Math.max(Number(reqQuery.page) || 1, 1)
  const limit = Math.max(Number(reqQuery.limit) || 12, 1)
  const search = reqQuery.search?.toString() || ''
  return { page, limit, search }
}
