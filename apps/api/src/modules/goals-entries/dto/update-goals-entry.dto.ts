import { PartialType } from '@nestjs/mapped-types'
import { CreateGoalsEntryDto } from './create-goals-entry.dto'
import { IsInt, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RecreateGoalsEntryDto extends PartialType(CreateGoalsEntryDto) {
  @ApiProperty()
  @IsInt()
  @IsOptional()
  current_calories: number

  @ApiProperty()
  @IsInt()
  @IsOptional()
  current_steps: number

  @ApiProperty()
  @IsInt()
  @IsOptional()
  current_floors_climbed: number

  @ApiProperty()
  @IsOptional()
  current_water_litres: number

  @ApiProperty()
  @IsOptional()
  current_sleep_hours: number
}
