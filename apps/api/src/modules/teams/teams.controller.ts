import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { ImagesService } from '../images/images.service'
import { UploadOptions, Uploads } from '../../decorators/uploads.decorator'
import { Files } from '../../decorators/files.decorator'
import { Image, ImageType } from '../images/entities/image.entity'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller()
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly imagesService: ImagesService
  ) {}

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Post('/organisation/:organisationId/teams')
  @Uploads('avatar', UploadOptions.Nullable)
  async organisationCreate(
    @Body() createTeamDto: CreateTeamDto,
    @Files('avatar') file: Storage.MultipartFile,
    @Param('organisationId') organisationId: string
  ) {
    const alt = createTeamDto.name
    let avatar: Image
    if (file) {
      avatar = await this.imagesService.createOne(file, ImageType.Avatar, {
        alt
      })
    }
    return this.teamsService.create(
      {
        ...createTeamDto,
        avatar
      },
      organisationId
    )
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisation/:organisationId/teams')
  organisationFindAll(@Param('organisationId') organisationId: string) {
    return this.teamsService.findAll(organisationId)
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisation/:organisationId/teams/:id')
  organisationFindOne(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string
  ) {
    return this.teamsService.findOne(id, organisationId)
  }

  @Put('/organisation/:organisationId/teams/:id')
  @Uploads('avatar', UploadOptions.Nullable)
  async organisationUpdate(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string,
    @Files('avatar') file: Storage.MultipartFile,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    const alt = updateTeamDto.name || ''
    let avatar: Image

    if (file) {
      avatar = await this.imagesService.createOne(file, ImageType.Avatar, {
        alt
      })
    }
    if (file === null) {
      return this.teamsService.removeAvatar(id)
    }
    return this.teamsService.update(
      id,
      {
        ...updateTeamDto,
        avatar
      },
      organisationId
    )
  }

  @Delete('/organisation/:organisationId/teams/:id')
  organisationRemove(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string
  ) {
    return this.teamsService.remove(id, organisationId)
  }

  @Iam(Roles.SuperAdmin)
  @Get('/teams')
  findAll() {
    return this.teamsService.findAll()
  }

  @Iam(Roles.SuperAdmin)
  @Get('/teams/:id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id)
  }

  @Iam(Roles.SuperAdmin)
  @Delete('/teams/:id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id)
  }
}
