import { ImageType } from '../entities/image.entity'

export class CreateImageDto {
  image: File
  type?: ImageType
}
