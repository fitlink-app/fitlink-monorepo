import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class RespondTeamsInvitationDto {
  @ApiProperty()
  @IsBoolean()
  accept: boolean

  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  join: boolean
}
