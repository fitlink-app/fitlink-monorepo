import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class SearchUserDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Keyword parameter must be provided'
  })
  q: string
}

export class SearchUserForLeaguesDto {
  @ApiProperty()
  @IsOptional()
  q?: string
}
