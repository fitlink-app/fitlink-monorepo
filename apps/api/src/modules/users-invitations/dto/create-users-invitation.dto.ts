import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'

export class CreateUsersInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  invitee: string
}

export class CreateUsersInvitationResultDto {
  @ApiProperty()
  inviteLink: string

  @ApiProperty()
  token: string
}
