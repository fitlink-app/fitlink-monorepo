import { PartialType } from '@nestjs/mapped-types'
import { CreateSubscriptionsInvitationDto } from './create-subscriptions-invitation.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { User } from '../../users/entities/user.entity'

export class UpdateTeamsInvitationDto extends PartialType(
  CreateSubscriptionsInvitationDto
) {
  @ApiProperty()
  @IsBoolean()
  dismissed: boolean

  @ApiProperty()
  @IsBoolean()
  accepted: boolean

  @ApiProperty()
  @IsOptional()
  resolved_user?: User
}
