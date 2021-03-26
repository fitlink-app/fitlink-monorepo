import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateFollowingDto {
  @ApiProperty()
  @IsString()
  targetId: string
}
