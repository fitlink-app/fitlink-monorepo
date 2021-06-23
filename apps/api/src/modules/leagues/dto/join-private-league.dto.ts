import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class JoinPrivateLeagueDto {
  /** Token is required for private leagues */
  @ApiProperty()
  token: string
}

export class JoinPrivateLeagueResultDto {
  @ApiProperty()
  success: boolean

  /** The league id */
  @ApiProperty()
  id: string
}
