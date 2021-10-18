import { ApiProperty } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

export class CreateFcmTokens {
  @ApiProperty()
  @IsArray()
  tokens: string[]
}
