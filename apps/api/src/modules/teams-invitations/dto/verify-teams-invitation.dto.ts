import { ApiProperty } from '@nestjs/swagger'

export class VerifyTeamsInvitationDto {
  @ApiProperty()
  token: string
}
