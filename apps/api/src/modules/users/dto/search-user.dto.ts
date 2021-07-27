import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SearchUserDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Keyword parameter must be provided'
  })
  q: string
}

export class SearchUserForLeaguesDto {
  @ApiProperty({
    nullable: true,
    required: false
  })
  @IsOptional()
  q?: string

  @ApiProperty({
    nullable: true,
    required: false
  })
  @IsOptional()
  page?: number = 0
}
