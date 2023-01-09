import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class ClaimLeagueBfitDto {
  @ApiProperty()
  @IsNumber()
  amount: number
}
