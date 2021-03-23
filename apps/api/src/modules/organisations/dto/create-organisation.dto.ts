import { ApiProperty } from '@nestjs/swagger'
import { MaxLength, IsEnum, IsOptional, IsEmail } from 'class-validator'
import { Image } from '../../images/entities/image.entity'
import { OrganisationType } from '../entities/organisation.entity'

export class CreateOrganisationDto {
  @ApiProperty()
  @MaxLength(60)
  name: string

  @ApiProperty()
  @IsEnum(OrganisationType)
  type: OrganisationType

  @ApiProperty()
  @IsOptional()
  type_other?: string

  @ApiProperty()
  @IsOptional()
  timezone: string

  @ApiProperty()
  @IsOptional()
  avatar: Image

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty()
  @IsOptional()
  invitee?: string
}
