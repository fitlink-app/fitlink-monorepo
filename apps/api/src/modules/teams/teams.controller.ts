import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common'
import { TeamsService } from './teams.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { ImagesService } from '../images/images.service'
import { UploadOptions, Uploads } from '../../decorators/uploads.decorator'
import { Files } from '../../decorators/files.decorator'
import { Image, ImageType } from '../images/entities/image.entity'

@Controller()
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly imagesService: ImagesService
  ) {}

  @Post('/organisation/:organisationId/teams')
  @Uploads('avatar', UploadOptions.Nullable)
  async organisationCreate(
    @Files('avatar') file: Storage.MultipartFile,
    @Body() createTeamDto: CreateTeamDto,
    @Param('organisationId') organisationId: string
  ) {
    const alt = createTeamDto.name
    let avatar: Image
    if (avatar) {
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

  @Get('/organisation/:organisationId/teams')
  organisationFindAll(@Param('organisationId') organisationId: string) {
    return this.teamsService.findAll(organisationId)
  }

  @Get('/organisation/:organisationId/teams/:id')
  organisationFindOne(@Param('id') id: string) {
    return this.teamsService.findOne(id)
  }

  @Put('/organisation/:organisationId/teams/:id')
  organisationUpdate(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    return this.teamsService.update(id, updateTeamDto)
  }

  @Delete('/organisation/:organisationId/teams/:id')
  organisationRemove(@Param('id') id: string) {
    return this.teamsService.remove(id)
  }

  // ----- -------------
  // ----- -------------
  // ----- -------------

  @Post('/teams')
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto)
  }

  @Get('/teams')
  findAll() {
    return this.teamsService.findAll()
  }

  @Get('/teams/:id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id)
  }

  @Put('/teams/:id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto)
  }

  @Delete('/teams/:id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id)
  }
}
