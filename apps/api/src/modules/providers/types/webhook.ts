import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString } from 'class-validator'
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

  @ApiProperty({
    description:
      "UTC offset for offsetting the UTC timestamps to owner's local time when the activity was tracked (seconds)"
  })
  @IsOptional()
  utc_offset: number

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  token?: string;
}
