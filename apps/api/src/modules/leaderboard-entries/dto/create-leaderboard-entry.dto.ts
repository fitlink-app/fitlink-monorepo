import { IsInt, IsString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateLeaderboardEntryDto {
  @ApiProperty()
  @IsString()
  leaderboard_id: string

  @ApiProperty()
  @IsString()
  league_id: string

  @ApiProperty()
  @IsString()
  user_id: string

  @ApiProperty()
  @IsInt()
  @IsOptional()
  points?: number

  @ApiProperty()
  @IsInt()
  @IsOptional()
  wins?: number
}
