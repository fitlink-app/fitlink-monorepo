import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsNotEmpty, IsString, IsBoolean } from 'class-validator'

export class GoalQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start_at: string

  @ApiProperty()
  @IsOptional()
  end_at?: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  exclude_zero_values?: boolean
}
