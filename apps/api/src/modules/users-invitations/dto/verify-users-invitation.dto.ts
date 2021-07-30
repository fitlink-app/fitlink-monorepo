import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class VerifyUsersInvitationDto {
  @ApiProperty()
  @IsString()
  token: string
}
