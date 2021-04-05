import { ApiProperty } from '@nestjs/swagger'
import {
  IsUrl,
  IsLatLong,
  IsArray,
  IsOptional,
  IsString
} from 'class-validator'
import { Image } from '../../images/entities/image.entity'

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsString()
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
  @IsOptional()
  organizer_image?: Image

  @ApiProperty()
  cost?: string

  @ApiProperty()
  organizer_name?: string
}
