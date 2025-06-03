import { BaseFilterParams } from '../shared'

export interface ProductFilterParams extends BaseFilterParams {
  categoryId?: string
}

export interface ProductFilterParams2 extends BaseFilterParams {
  categoriesIds?: string[]
  unitiesIds?: string[]
  priceRange?: number[]
  inStockOnly?: boolean
}
