import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class VerifyTeamsInvitationDto {
  @ApiProperty()
  @IsString()
  token: string
}
