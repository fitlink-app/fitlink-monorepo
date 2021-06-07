import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'
import { User } from '../../users/entities/user.entity'

export class CreateUsersInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  invitee: string

  inviter: Partial<User>
}

export class CreateUsersInvitationResultDto {
  @ApiProperty()
  inviteLink: string

  @ApiProperty()
  token: string
}
