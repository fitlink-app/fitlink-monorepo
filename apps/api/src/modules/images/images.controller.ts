import { Controller, Get, Post, Param, Delete, Body } from '@nestjs/common'
import { ImagesService } from './images.service'
import { File } from '../../decorators/files.decorator'
import { Image } from '../images/entities/image.entity'
import { ImageType } from '../images/images.constants'
import { UploadImageDto } from '../images/dto/create-image.dto'
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  DeleteResponse
} from '../../decorators/swagger.decorator'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models/authenticated-user.model'
import { User } from '../../modules/users/entities/user.entity'
import { Upload } from '../../decorators/uploads.decorator'

@ApiBaseResponses()
@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiBody({ type: UploadImageDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ type: Image, status: 201 })
  @Upload({
    maxFileSize: 10,
    fileType: 'image'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  create(
    @File() file: Storage.MultipartFile,
    @Body() body: UploadImageDto,
    @AuthUser() user: AuthenticatedUser
  ): Promise<Image> {
    const owner = new User()
    owner.id = user.id
    return this.imagesService.createOne(file, body.type, {
      owner,
      type: body.type || ImageType.Standard
    })
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
