import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class VerifyOrganisationsInvitationDto {
  @ApiProperty()
  @IsString()
  token: string
}
