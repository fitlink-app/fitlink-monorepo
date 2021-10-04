import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class RespondSubscriptionsInvitationDto {
  @ApiProperty()
  @IsBoolean()
  accept: boolean

  @ApiProperty()
  @IsString()
  token: string
}
