import { BaseFilterParams } from '../shared'

export interface ProductFilterParams extends BaseFilterParams {
  categoriesIds?: string[]
  unitiesIds?: string[]
  priceRange?: number[]
  inStockOnly?: boolean
}
