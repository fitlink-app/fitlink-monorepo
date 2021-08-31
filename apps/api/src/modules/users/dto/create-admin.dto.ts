import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { Roles } from '../../user-roles/user-roles.constants'

export class CreateAdminDto {
  @ApiProperty()
  @IsUUID()
  userId?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles
}
