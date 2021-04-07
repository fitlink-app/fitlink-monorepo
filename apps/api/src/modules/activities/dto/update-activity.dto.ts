import { PartialType } from '@nestjs/mapped-types'
import { CreateActivityDto } from './create-activity.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsIn } from 'class-validator'

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @ApiProperty()
  @IsIn(['0', '1'])
  @IsOptional()
  __replaceImages?: '0' | '1'

  @ApiProperty()
  @IsOptional()
  __deleteImages?: string
}
