import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'


export class CreateFollowingDto {
  @ApiProperty()
  @IsString()
  followerId: string

  @ApiProperty()
  @IsString()
  followingId: string
}
