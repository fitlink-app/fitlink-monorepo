import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional } from 'class-validator'
import { ProviderType } from '../providers.constants'

export type WebhookEventData = {
  activities: WebhookEventActivity[]
}

export class WebhookEventActivity {
  @ApiProperty()
  type: string // name_key of sport

  @ApiProperty()
  provider: ProviderType

  @ApiProperty()
  start_time: string

  @ApiProperty()
  end_time: string

  @ApiProperty()
  @IsOptional()
  calories: number

  @ApiProperty()
  @IsOptional()
  distance: number

  @ApiProperty()
  @IsOptional()
  quantity: number
}

export class WebhookEventPayload {
  @ApiProperty()
  @IsArray()
  activities: WebhookEventActivity[]
}
