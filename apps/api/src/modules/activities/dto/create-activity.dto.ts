import { ApiProperty } from '@nestjs/swagger'
import {
  IsUrl,
  IsLatLong,
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty,
  IsUUID
} from 'class-validator'

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
  @IsUUID(4, {
    message: 'Organizer image must be a valid image'
  })
  @IsOptional()
  organizer_image?: string

  @ApiProperty()
  @IsString({
    message: 'Images must be a comma separated list of UUIDs'
  })
  @IsOptional()
  images?: string

  @ApiProperty()
  @IsOptional()
  cost?: string
}
