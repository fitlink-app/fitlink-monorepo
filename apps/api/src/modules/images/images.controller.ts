import {
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete
} from '@nestjs/common'
import { ImagesService } from './images.service'
import { CreateImageDto } from './dto/create-image.dto'
import { UpdateImageDto } from './dto/update-image.dto'
import { File } from '../../decorators/file.decorator'
import { UploadGuard } from '../../guards/upload.guard'

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseGuards(UploadGuard)
  async create(
    @File() image: Storage.MultipartFile,
    @Body() createImageDto: CreateImageDto
  ) {
    const file = await image.toBuffer()
    return this.imagesService.create(file)
  }

  @Get()
  findAll() {
    return this.imagesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(+id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(+id, updateImageDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(+id)
  }
}
