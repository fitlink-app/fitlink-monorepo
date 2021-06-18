import { ProviderType } from '../../providers/entities/provider.entity'
import { Sport } from '../../sports/entities/sport.entity'
import { healthActivityType } from './healthActivityType'
import { lifestyleActivityType } from './lifestyleActivityType'

export class HealthActivityDto {
  type: lifestyleActivityType | healthActivityType | 'unknown'
  provider: ProviderType
  start_time: string
  end_time: string
  active_time?: number
  calories: number
  distance?: number
  quantity?: number
  elevation?: number
  polyline?: string
}

export class CreateHealthActivityDto extends HealthActivityDto {}
