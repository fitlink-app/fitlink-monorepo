import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional
} from 'class-validator'
import { RewardRedeemType } from '../rewards.constants'

export class RewardFiltersDto {
  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  locked?: boolean = false

  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  expired?: boolean = false

  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  available?: boolean = false

  @ApiProperty()
  @IsEnum(RewardRedeemType, {
    message: 'Must be a valid access type'
  })
  @IsOptional()
  redeem_type: RewardRedeemType

  @ApiProperty({
    required: false,
    nullable: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
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
