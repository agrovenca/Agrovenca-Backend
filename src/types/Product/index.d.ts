import { BaseFilterParams } from '../shared'

export interface ProductFilterParams extends BaseFilterParams {
  categoriesId?: string[]
  unitiesIds?: string[]
  priceRange?: number[]
  inStockOnly?: boolean
}
