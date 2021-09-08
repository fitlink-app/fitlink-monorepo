import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'

/**
 * Only for administrators, it's not possible to "join"
 * an organisation as you rather join one via a team that belongs
 * to an organisation.
 */
export class RespondOrganisationsInvitationDto {
  @ApiProperty()
  @IsBoolean()
  accept: boolean

  @ApiProperty()
  @IsString()
  token: string
}
