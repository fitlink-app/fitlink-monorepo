import { PartialType } from '@nestjs/mapped-types'
import { CreateOrganisationsInvitationDto } from './create-organisations-invitation.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { User } from '../../users/entities/user.entity'

export class UpdateOrganisationsInvitationDto extends PartialType(
  CreateOrganisationsInvitationDto
) {
  @ApiProperty()
  @IsBoolean()
  dismissed: boolean

  @ApiProperty()
  @IsBoolean()
  accepted: boolean
}
