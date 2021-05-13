import { PartialType } from '@nestjs/mapped-types'
import { CreateDefaultSubscriptionDto } from './create-default-subscription.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class UpdateSubscriptionDto extends PartialType(CreateDefaultSubscriptionDto) {
  @ApiProperty()
  @IsOptional()
  usersIdsList?: Array<string>
}
