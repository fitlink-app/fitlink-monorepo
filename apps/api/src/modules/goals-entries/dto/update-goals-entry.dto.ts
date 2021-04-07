import { PartialType } from '@nestjs/mapped-types'
import { CreateGoalsEntryDto } from './create-goals-entry.dto'
import { IsInt, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RecreateGoalsEntryDto extends PartialType(CreateGoalsEntryDto) {

  @ApiProperty()
  @IsInt()
  target_calories: number

  @ApiProperty()
  @IsInt()
  target_steps: number

  @ApiProperty()
  @IsInt()
  target_floors_climbed: number

  @ApiProperty()
  target_water_litres: number

  @ApiProperty()
  target_sleep_hours: number

  @ApiProperty()
  @IsOptional()
  @IsInt()
  current_calories?: number

  @ApiProperty()
  @IsOptional()
  @IsInt()
  current_steps?: number

  @ApiProperty()
  @IsOptional()
  @IsInt()
  current_floors_climbed?: number

  @ApiProperty()
  @IsOptional()
  current_water_litres?: number

  @ApiProperty()
  @IsOptional()
  current_sleep_hours?: number
}
