import { BaseFilterParams } from '../shared'

export interface UserFilterParams extends BaseFilterParams {
  isActive: 'active' | 'inactive' | undefined
}
