import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Request,
  Delete
} from '@nestjs/common'
import { OrganisationsService } from './organisations.service'
import { CreateOrganisationDto } from './dto/create-organisation.dto'
import { UpdateOrganisationDto } from './dto/update-organisation.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'
import { Files } from '../../decorators/files.decorator'
import { ImagesService } from '../images/images.service'
import { Uploads, UploadOptions } from '../../decorators/uploads.decorator'

@Controller('organisations')
export class OrganisationsController {
  constructor(
    private readonly organisationsService: OrganisationsService,
    private readonly imagesService: ImagesService
  ) {}

  @Iam(Roles.SuperAdmin)
  @Uploads('avatar', UploadOptions.Nullable)
  @Post()
  async create(
    @Files('avatar') files: Storage.MultipartFile[],
    @Body() createOrganisationDto: CreateOrganisationDto
  ) {
    let image = {}
    if (files.length) {
      const avatar = await this.imagesService.createOne(files[0])
      image = { avatar }
    }
    return this.organisationsService.create({
      ...createOrganisationDto,
      ...image
    })
  }

  @Iam(Roles.SuperAdmin)
  @Get()
  findAll(@Request() request) {
    return this.organisationsService.findAll({
      limit: request.query.limit || 10,
      page: request.query.page || 0
    })
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Get(':organisationId')
  findOne(@Param('organisationId') id: string) {
    return this.organisationsService.findOne(id)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Put(':organisationId')
  update(
    @Param('organisationId') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto
  ) {
    return this.organisationsService.update(id, updateOrganisationDto)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Delete(':organisationId')
  remove(@Param('organisationId') id: string) {
    return this.organisationsService.remove(id)
  }
}
