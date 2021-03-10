import { PartialType } from '@nestjs/mapped-types'
import { CreateLeaguesInvitationDto } from './create-leagues-invitation.dto'

export class UpdateLeaguesInvitationDto extends PartialType(
  CreateLeaguesInvitationDto
) {}
