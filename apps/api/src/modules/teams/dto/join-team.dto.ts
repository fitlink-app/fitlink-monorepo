import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class JoinTeamDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  token?: string
}
