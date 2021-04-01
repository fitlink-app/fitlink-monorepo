import { Controller, Get, Post, Param, Delete } from '@nestjs/common'
import { ImagesService } from './images.service'
import { Files } from '../../decorators/files.decorator'
import { Uploads, UploadOptions } from '../../decorators/uploads.decorator'
import { Image } from '../images/entities/image.entity'

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @Uploads('images[]', UploadOptions.Required)
  create(@Files('images[]') files: Storage.MultipartFile[]): Promise<Image[]> {
    return this.imagesService.createMany(files)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id)
  }
}
