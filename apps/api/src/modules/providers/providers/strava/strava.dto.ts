import { ApiProperty } from '@nestjs/swagger'

export class OauthUrl {
  @ApiProperty()
  oauth_url: string
}
