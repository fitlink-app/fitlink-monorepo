import { PartialType } from '@nestjs/mapped-types'
import { CreateTeamsInvitationDto } from './create-teams-invitation.dto'

export class UpdateTeamsInvitationDto extends PartialType(
  CreateTeamsInvitationDto
) {}
