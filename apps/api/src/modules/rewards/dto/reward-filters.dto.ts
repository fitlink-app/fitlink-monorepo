import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class RewardFiltersDto {
  @ApiProperty({
    required: false
  })
  @IsOptional()
  locked?: boolean = false

  @ApiProperty({
    required: false
  })
  @IsOptional()
  expired?: boolean = false

  @ApiProperty({
    required: false
  })
  @IsOptional()
  available?: boolean = false
}
