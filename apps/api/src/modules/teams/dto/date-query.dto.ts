import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsNotEmpty, IsString } from 'class-validator'

export class DateQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start_at: string

  @ApiProperty()
  @IsOptional()
  end_at?: string
}
