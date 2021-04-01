import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateLeagueDto {
  @ApiProperty()
  @IsNotEmpty()
  sportId: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string
}
