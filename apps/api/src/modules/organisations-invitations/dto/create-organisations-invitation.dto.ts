import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'
import { Organisation } from '../../organisations/entities/organisation.entity'

export class CreateOrganisationsInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  invitee: string
}
