import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional } from 'class-validator'

export class CreateOrganisationsInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  invitee: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  admin: boolean
}
