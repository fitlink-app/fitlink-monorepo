import { ApiProperty } from '@nestjs/swagger'

export class UpdateHealthActivityImagesDto {
  @ApiProperty()
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
