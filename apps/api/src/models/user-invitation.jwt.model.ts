import { ApiProperty } from '@nestjs/swagger'

export class UserInvitationJWT {
  @ApiProperty()
  aud: 'fitlinkteams.com'

  @ApiProperty()
  iss: 'fitlinkteams.com'

  @ApiProperty()
  sub: string

  @ApiProperty()
  type: 'user-invitation'
}
