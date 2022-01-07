import { ProviderType } from '../../providers/providers.constants'
import { healthActivityType } from './healthActivityType'
import { lifestyleActivityType } from './lifestyleActivityType'

export class HealthActivityDto {
  type: lifestyleActivityType | healthActivityType | 'unknown'
  provider: ProviderType
  start_time: string
  end_time: string
  active_time?: number
  utc_offset: number // seconds
  calories: number
  distance?: number
  quantity?: number
  elevation?: number
  polyline?: string
  title?: string
}

export class CreateHealthActivityDto extends HealthActivityDto {}
