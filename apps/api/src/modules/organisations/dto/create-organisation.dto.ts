import { ApiProperty } from '@nestjs/swagger'
import { IsTimezone } from '../../../decorators/class-validator/IsTimezone'
import { MaxLength, IsEnum, IsOptional, IsEmail, IsUUID } from 'class-validator'
import { Image } from '../../images/entities/image.entity'
import { OrganisationsInvitation } from '../../organisations-invitations/entities/organisations-invitation.entity'
import { Organisation } from '../entities/organisation.entity'
import { OrganisationMode, OrganisationType } from '../organisations.constants'

export class CreateOrganisationDto {
  @ApiProperty()
  @MaxLength(60)
  name: string

  @ApiProperty()
  @IsEnum(OrganisationType)
  type: OrganisationType

  @ApiProperty()
  @IsEnum(OrganisationMode)
  mode: OrganisationMode

  @ApiProperty()
  @IsOptional()
  type_other?: string

  @ApiProperty()
  @IsOptional()
  @IsTimezone()
  timezone?: string

  @ApiProperty()
  @IsUUID(4, {
    message: 'Must be a valid image id'
  })
  @IsOptional()
  imageId?: string

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty()
  @IsOptional()
  invitee?: string
}

export class CreateOrganisationDtoResult {
  organisation: Organisation
  invitation: OrganisationsInvitation
  inviteLink: string
}
