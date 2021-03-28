import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'
import { Team } from '../../teams/entities/team.entity'

export class CreateTeamsInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  invitee: string

  @ApiProperty()
  team: Team
}
