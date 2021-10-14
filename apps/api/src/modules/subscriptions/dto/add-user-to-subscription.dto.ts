import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class AddUserToSubscriptionDto {
  @ApiProperty()
  @IsUUID(4, {
    message: 'Must be a valid user'
  })
  id: string
}
