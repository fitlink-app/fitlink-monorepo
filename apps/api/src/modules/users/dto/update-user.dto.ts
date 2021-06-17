import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsUUID,
  MinLength
} from 'class-validator'
import { UnitSystem } from '../entities/user.entity'
import { IsTimezone } from '../../../decorators/class-validator/IsTimezone'

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @MinLength(2, {
    message: 'Name must be at least 2 characters long'
  })
  name: string

  @ApiProperty({
    enum: UnitSystem
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UnitSystem, {
    message: 'Unit system must be metric or imperial'
  })
  unit_system: UnitSystem

  @ApiProperty({
    example: 'Etc/UTC'
  })
  @IsOptional()
  @IsNotEmpty()
  @IsTimezone()
  timezone: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  onboarded: boolean

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_mindfulness_minutes: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_steps: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_floors_climbed: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_water_litres: number

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  goal_sleep_hours: number
}

export class UpdateUserAvatarDto {
  @ApiProperty()
  @IsUUID(4, {
    message: 'Invalid image id'
  })
  imageId: string
}
