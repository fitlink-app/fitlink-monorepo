import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength
} from 'class-validator'
import { UnitSystem } from '../users.constants'
import { IsTimezone } from '../../../decorators/class-validator/IsTimezone'

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long'
  })
  name?: string

  @ApiProperty({
    enum: UnitSystem
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UnitSystem, {
    message: 'Unit system must be metric or imperial'
  })
  unit_system?: UnitSystem

  @ApiProperty({
    example: 'Etc/UTC'
  })
  @IsOptional()
  @IsNotEmpty()
  @IsTimezone()
  timezone?: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  onboarded?: boolean

  @ApiProperty()
  @IsOptional()
  mobile_os?: string

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_mindfulness_minutes?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_steps?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_floors_climbed?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_water_litres?: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_sleep_hours?: number
}

export class UpdateBasicUserDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID(4, {
    message: 'Invalid image id'
  })
  imageId: string

  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Must be a valid email address'
    }
  )
  email: string

  @ApiProperty()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long'
  })
  name: string
}

export class UpdateUserAvatarDto {
  @ApiProperty()
  @IsUUID(4, {
    message: 'Invalid image id'
  })
  imageId: string
}

export class UpdateUserEmailDto {
  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Must be a valid email address'
    }
  )
  email: string
}

export class VerifyUserEmailDto {
  @ApiProperty()
  @IsString()
  token: string
}

export class VerifyUserEmailResultDto {
  @ApiProperty()
  @IsString()
  success: boolean
}

export class UpdateUserPasswordDto {
  @ApiProperty()
  @IsString()
  current_password: string

  @ApiProperty()
  @IsString()
  new_password: string
}
