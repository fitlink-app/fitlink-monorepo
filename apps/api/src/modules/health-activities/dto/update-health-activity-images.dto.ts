import { ApiProperty } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

export class UpdateHealthActivityImagesDto {
  @ApiProperty({
    isArray: true
  })
  @IsArray({
    message: 'Must be array of imageIds'
  })
  images: string[]
}

export class ShareHealthActivityImageDto {
  @ApiProperty()
  image_url: string

  @ApiProperty()
  stats: {
    value: string
    label: string
  }[]
}
