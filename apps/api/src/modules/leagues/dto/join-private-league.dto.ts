import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class JoinPrivateLeagueDto {
  /** Token is required for private leagues */
  @ApiProperty()
  @IsString()
  token: string
}

export class JoinPrivateLeagueResultDto {
  @ApiProperty()
  success: boolean

  /** The league id */
  @ApiProperty()
  id: string
}
