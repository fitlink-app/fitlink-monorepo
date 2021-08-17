import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, IsUUID, IsEnum } from 'class-validator'
import { Roles } from '../../user-roles/user-roles.constants'

export class AuthSwitchDto {
  @ApiProperty()
  @IsUUID(4, {
    message: 'Must be a valid UUID'
  })
  id: string

  @ApiProperty()
  @IsEnum(Roles)
  role: Roles
}
