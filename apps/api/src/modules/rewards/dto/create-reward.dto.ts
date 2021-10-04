import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator'
import { RewardAccess } from '../rewards.constants'

export class CreateRewardDto {
  @ApiProperty()
  @IsUUID(4)
  @IsOptional()
  teamId?: string

  @ApiProperty()
  @IsUUID(4)
  @IsOptional()
  organisationId?: string

  @ApiProperty()
  @IsUUID(4)
  imageId: string

  @ApiProperty()
  @MinLength(3, {
    message: 'Must have a descriptive length'
  })
  description: string

  @ApiProperty()
  @MinLength(3, {
    message: 'Must have a descriptive name'
  })
  name: string

  @ApiProperty()
  @MinLength(3, {
    message: 'Must have a descriptive length'
  })
  @MaxLength(80, {
    message: 'Must not exceed 80 characters in length'
  })
  name_short: string

  @ApiProperty()
  @MinLength(3, {
    message: 'Must have a descriptive length'
  })
  code: string

  @ApiProperty()
  @IsUrl(
    {},
    {
      message: 'Must be a valid URL'
    }
  )
  @IsOptional()
  redeem_url?: string

  @ApiProperty()
  @MinLength(3, {
    message: 'Must have a descriptive length'
  })
  brand: string

  @ApiProperty()
  @IsInt({
    message: 'Must be a number'
  })
  points_required: number

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  limit_units?: boolean = false

  @ApiProperty()
  @IsInt()
  @IsOptional()
  units_available?: number = 0

  @ApiProperty()
  @IsDateString(
    {},
    {
      message: 'Must be a valid date'
    }
  )
  reward_expires_at: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(RewardAccess, {
    message: 'Must be a valid access type'
  })
  access?: RewardAccess = RewardAccess.Public
}
