import { ApiProperty } from '@nestjs/swagger'

export class VerifyOrganisationsInvitationDto {
  @ApiProperty()
  token: string
}
