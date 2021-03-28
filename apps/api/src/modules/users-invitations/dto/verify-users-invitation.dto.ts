import { ApiProperty } from '@nestjs/swagger'

export class VerifyUsersInvitationDto {
  @ApiProperty()
  token: string
}
