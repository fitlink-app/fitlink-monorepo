import { ApiProperty } from '@nestjs/swagger'

export class UserInvitationJWT {
  @ApiProperty()
  aud: 'fitlinkapp.com'

  @ApiProperty()
  iss: 'fitlinkapp.com'

  @ApiProperty()
  sub: string

  @ApiProperty()
  iat: number

  @ApiProperty()
  type: 'user-invitation'
}
