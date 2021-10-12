import { ApiProperty } from '@nestjs/swagger'
import { ToBoolean } from '../../../classes/class-transformer/to-boolean'
import { IsOptional } from 'class-validator'

export class FeedFilterDto {
  @ApiProperty()
  @IsOptional()
  @ToBoolean()
  friends_activities: boolean

  @ApiProperty()
  @IsOptional()
  @ToBoolean()
  my_goals: boolean

  @ApiProperty()
  @IsOptional()
  @ToBoolean()
  my_updates: boolean
}
