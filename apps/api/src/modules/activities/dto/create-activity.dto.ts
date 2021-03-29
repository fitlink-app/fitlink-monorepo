import { ApiProperty } from '@nestjs/swagger'
import { IsUrl, IsLatLong, IsArray, IsOptional } from 'class-validator'
import { Image } from '../../images/entities/image.entity'

export class CreateActivityDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  date: string

  @ApiProperty()
  meeting_point_text: string

  @ApiProperty()
  @IsUrl()
  organizer_url: string

  @ApiProperty()
  @IsLatLong()
  meeting_point: string

  @ApiProperty()
  @IsArray()
  @IsOptional()
  images?: Image[]

  @ApiProperty()
  cost?: string

  @ApiProperty()
  organizer_name?: string
}
