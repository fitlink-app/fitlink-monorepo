import { Controller, Get, Post, Param, Delete } from '@nestjs/common'
import { ImagesService } from './images.service'
import { Files } from '../../decorators/files.decorator'
import { Uploads, UploadOptions } from '../../decorators/uploads.decorator'
import { Image } from '../images/entities/image.entity'
import { UploadImageDto } from '../images/dto/create-image.dto'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  DeleteResponse
} from '../../decorators/swagger.decorator'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@ApiBaseResponses()
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({ type: Image, isArray: true, status: 201 })
  @Uploads('images[]', UploadOptions.Required)
  create(@Files('images[]') files: Storage.MultipartFile[]): Promise<Image[]> {
    return this.imagesService.createMany(files)
  }

  @Get(':id')
  @ApiResponse({ type: Image, status: 200 })
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(id)
  }

  // TODO: Need to add an owner to image entity, to allow deletion by a user
  @Iam(Roles.SuperAdmin)
  @Delete(':id')
  @DeleteResponse()
  remove(@Param('id') id: string) {
    return this.imagesService.remove(id)
  }
}
