import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  MinLength
} from 'class-validator'
import { UnitSystem } from '../entities/user.entity'

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @MinLength(2)
  name: string

  @ApiProperty({
    enum: UnitSystem
  })
  @IsOptional()
  @IsNotEmpty()
  unit_system: UnitSystem

  @ApiProperty({
    example: 'Etc/UTC'
  })
  @IsOptional()
  @IsNotEmpty()
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
  imageId: string
}
