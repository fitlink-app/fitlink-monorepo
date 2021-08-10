import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsUUID } from 'class-validator'
import { CreateDefaultSubscriptionDto } from './create-default-subscription.dto'
import { IsOptional } from 'class-validator'
import { SubscriptionType } from '../subscriptions.constants'

export class UpdateSubscriptionDto extends PartialType(
  CreateDefaultSubscriptionDto
) {
  @ApiProperty()
  @IsOptional()
  usersIdsList?: Array<string>

  @ApiProperty()
  @IsOptional()
  @IsUUID(4, {
    message: 'A valid organisation is required'
  })
  organisationId?: string
}
