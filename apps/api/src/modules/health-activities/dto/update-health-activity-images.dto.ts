import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsUUID } from 'class-validator'

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
  @IsUUID(4, {
    message: 'Must be a valid image id'
  })
  @IsOptional()
  imageId?: string
}
