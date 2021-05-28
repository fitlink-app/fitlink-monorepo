import { ApiProperty } from '@nestjs/swagger'
import {
  IsUrl,
  IsLatLong,
  IsArray,
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty
} from 'class-validator'
import { Image } from '../../images/entities/image.entity'

const message = 'This field is required'

export class CreateActivityDto {
  @ApiProperty()
  @IsString({ message })
  @IsNotEmpty({ message })
  name: string

  @ApiProperty()
  @IsString({ message })
  @IsNotEmpty({ message })
  description: string

  @ApiProperty()
  @IsString({ message })
  @IsNotEmpty({ message })
  date: string

  @ApiProperty()
  @IsLatLong({
    message: 'This field requires a valid point (lat,lng,radius)'
  })
  meeting_point: string

  @ApiProperty()
  @IsString({ message })
  @IsNotEmpty({ message })
  meeting_point_text: string

  @ApiProperty()
  @IsOptional()
  organizer_name?: string

  @ApiProperty()
  @IsUrl(
    {},
    {
      message: 'This field requires a valid url'
    }
  )
  @IsOptional()
  organizer_url?: string

  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'This field requires a valid email address'
    }
  )
  @IsOptional()
  organizer_email?: string

  @ApiProperty()
  @IsOptional()
  organizer_telephone?: string

  @ApiProperty()
  @IsOptional()
  organizer_image?: Image

  @ApiProperty()
  @IsArray()
  @IsOptional()
  images?: Image[]

  @ApiProperty()
  @IsOptional()
  cost?: string

  @ApiProperty()
  @IsOptional()
  user_id?: string
}
