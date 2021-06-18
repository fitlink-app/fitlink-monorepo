import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class SearchUserDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Keyword parameter must be provided'
  })
  q: string
}
