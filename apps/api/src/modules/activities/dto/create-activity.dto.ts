import { IsUrl, IsLatLong, IsArray, IsOptional } from 'class-validator'
import { Image } from '../../images/entities/image.entity'

export class CreateActivityDto {
  name: string
  description: string
  date: string
  meeting_point_text: string

  @IsUrl()
  organizer_url: string

  @IsLatLong()
  meeting_point: string

  @IsArray()
  @IsOptional()
  images?: Image[]

  cost?: string
  organizer_name?: string
}
