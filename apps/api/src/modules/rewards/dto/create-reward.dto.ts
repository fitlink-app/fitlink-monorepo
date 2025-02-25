import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'
import { RewardAccess, RewardRedeemType } from '../rewards.constants'

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
  @MinLength(3, {
    message: 'Redeem instructions are required'
  })
  redeem_instructions: string

  @ApiProperty()
  @IsOptional()
  @Matches(new RegExp('^(https?)://|^$'), {
    message: 'Must be a valid URL starting with http:// or https://'
  })
  redeem_url?: string

  @ApiProperty()
  @MinLength(3, {
    message: 'Must have a descriptive length'
  })
  brand: string

  @ApiProperty()
  @IsEnum(RewardRedeemType, {
    message: 'Must be a valid access type'
  })
  redeem_type: RewardRedeemType = RewardRedeemType.Points

  @ApiProperty()
  @IsInt({
    message: 'Must be a number'
  })
  @IsOptional()
  points_required?: number

  @ApiProperty()
  @IsInt({
    message: 'Must be a number'
  })
  @IsOptional()
  bfit_required?: number

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
