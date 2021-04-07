import { IsInt } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateGoalsEntryDto {

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
}
