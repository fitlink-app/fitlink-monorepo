import { ApiProperty } from '@nestjs/swagger'

export class UserInvitationJWT {
  @ApiProperty()
  aud: 'fitlinkapp.com'

  @ApiProperty()
  iss: 'fitlinkapp.com'

  @ApiProperty()
  sub: string

  @ApiProperty()
  type: 'user-invitation'
}
