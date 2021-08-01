import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import { CreateDefaultSubscriptionDto } from './create-default-subscription.dto'
import { IsOptional } from 'class-validator'

export class UpdateSubscriptionDto extends PartialType(
  CreateDefaultSubscriptionDto
) {
  @ApiProperty()
  @IsOptional()
  usersIdsList?: Array<string>

  @ApiProperty()
  @IsUUID(4, {
    message: 'A valid organisation is required'
  })
  organisationId: string
}
