import { BaseFilterParams } from '../shared'

export interface ProductFilterParams extends BaseFilterParams {
  categoriesId?: string[]
  unitiesId?: string[]
  priceRange?: number[]
  inStockOnly?: boolean
}
