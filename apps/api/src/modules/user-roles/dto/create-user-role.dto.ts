import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { Roles } from '../entities/user-role.entity'

export class CreateUserRoleDto {
  @ApiProperty({
    enum: Roles,
    required: true
  })
  @IsNotEmpty()
  role: Roles

  @ApiProperty({
    nullable: true,
    required: false
  })
  @IsOptional()
  team?: string

  @ApiProperty({
    nullable: true,
    required: false
  })
  @IsOptional()
  organisation?: string

  @ApiProperty({
    nullable: true,
    required: false
  })
  @IsOptional()
  subscription?: string
}
