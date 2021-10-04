import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsOptional } from 'class-validator'

export class FeedFilterDto {
  @ApiProperty({
    required: false
  })
  @IsNumberString()
  @IsOptional()
  friends_activities?: '0' | '1' | boolean

  @ApiProperty({
    required: false
  })
  @IsNumberString()
  @IsOptional()
  my_goals?: '0' | '1' | boolean

  @ApiProperty({
    required: false
  })
  @IsNumberString()
  @IsOptional()
  my_updates?: '0' | '1' | boolean
}
