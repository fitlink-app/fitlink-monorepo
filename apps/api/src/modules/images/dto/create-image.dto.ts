import { ApiProperty } from '@nestjs/swagger'
import { ImageType } from '../entities/image.entity'

export class CreateImageDto {
  image: File
  type?: ImageType
}

export class UploadImageDto {
  @ApiProperty({ format: 'binary', type: 'string' })
  image: string
}
