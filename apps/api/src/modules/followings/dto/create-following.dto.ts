import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateFollowingDto {
  @ApiProperty()
  @IsString({
    message: 'The targeted user is required'
  })
  targetId: string
}
