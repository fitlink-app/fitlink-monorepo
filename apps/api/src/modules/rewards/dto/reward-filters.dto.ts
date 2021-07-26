import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class RewardFiltersDto {
  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsOptional()
  locked?: boolean = false

  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsOptional()
  expired?: boolean = false

  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsOptional()
  available?: boolean = false
}
