import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Roles } from '../entities/user-role.entity'

export class CreateUserRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  role: Roles

  @ApiProperty()
  @IsOptional()
  team?: string

  @ApiProperty()
  @IsOptional()
  organisation?: string

  @ApiProperty()
  @IsOptional()
  subscription?: string
}
