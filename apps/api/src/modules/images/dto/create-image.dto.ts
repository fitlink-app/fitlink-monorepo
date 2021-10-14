import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ImageType } from '../images.constants'

export class CreateImageDto {
  image: File
  type?: ImageType
}

export class UploadImageDto {
  @ApiProperty({ format: 'binary', type: 'string' })
  image: string

  @ApiProperty({
    enum: ImageType
  })
  @IsOptional()
  @IsEnum(ImageType, {
    message: 'Invalid image type'
  })
  type?: ImageType
}
