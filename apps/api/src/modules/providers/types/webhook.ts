import { ProviderType } from '../providers.constants'

export type WebhookEventData = {
  activities: WebhookEventActivity[]
}

export type WebhookEventActivity = {
  type: string // name_key of sport
  provider: ProviderType
  start_time: string
  end_time: string
  calories: number
  distance: number
  quantity: number
}
