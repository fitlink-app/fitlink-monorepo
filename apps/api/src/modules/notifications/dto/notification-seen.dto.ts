import { ApiProperty } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

export class NotificationSeenDto {
  @ApiProperty()
  @IsArray()
  notificationIds: string[]
}
