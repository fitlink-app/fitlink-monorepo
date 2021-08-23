import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional } from 'class-validator'

export class ActivityGlobalFilterDto {
  @ApiProperty({
    required: false
  })
  @IsIn(['1', '0'])
  @IsOptional()
  exclude_user_activities?: string
}
