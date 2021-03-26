import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateFollowingDto {
  @ApiProperty()
  @IsString()
  targetId: string
}
