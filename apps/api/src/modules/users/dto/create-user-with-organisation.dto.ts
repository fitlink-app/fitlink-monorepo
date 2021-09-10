import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength
} from 'class-validator'
import { OrganisationType } from '../../organisations/organisations.constants'

export class CreateUserWithOrganisationDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters in length'
  })
  password: string

  @ApiProperty()
  @IsNotEmpty()
  company: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(OrganisationType, {
    message: 'Must be a valid organisation type'
  })
  type: OrganisationType

  @ApiProperty()
  @IsNotEmpty()
  type_other: string

  @ApiProperty()
  @IsBoolean()
  agree_to_terms: boolean

  @ApiProperty()
  @IsBoolean()
  subscribe: boolean

  @ApiProperty()
  @IsString()
  date: string
}
