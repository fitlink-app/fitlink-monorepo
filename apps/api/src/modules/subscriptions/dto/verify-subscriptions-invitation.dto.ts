import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class VerifySubscriptionsInvitationDto {
  @ApiProperty()
  @IsString()
  token: string
}
