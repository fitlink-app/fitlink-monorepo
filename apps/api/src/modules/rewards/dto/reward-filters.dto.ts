import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsInt, IsNumberString, IsOptional } from 'class-validator'

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

  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsOptional()
  @Transform(({value}) =>
    value === 'true'
  )
  isPrivateOnly?: boolean = false
}

export class RewardGlobalFilterDto {
  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsNumberString({
    no_symbols: true
  })
  include_expired_rewards?: '0' | '1'
}
