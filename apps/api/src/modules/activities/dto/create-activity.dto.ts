import { ApiProperty } from '@nestjs/swagger'
import {
  IsUrl,
  IsLatLong,
  IsArray,
  IsOptional,
  IsString,
  IsEmail
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
  @IsEmail()
  @IsOptional()
  organizer_email?: string

  @ApiProperty()
  @IsOptional()
  organizer_telephone?: string

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
  @IsOptional()
  cost?: string

  @ApiProperty()
  @IsOptional()
  organizer_name?: string

  @ApiProperty()
  @IsOptional()
  user_id?: string
}
