import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { User } from '../../decorators/authenticated-user.decorator'
import { Files } from '../../decorators/files.decorator'
import { Iam } from '../../decorators/iam.decorator'
import { UploadOptions, Uploads } from '../../decorators/uploads.decorator'
import { AuthenticatedUser } from '../../models'
import { Image, ImageType } from '../images/entities/image.entity'
import { ImagesService } from '../images/images.service'
import { Roles } from '../user-roles/entities/user-role.entity'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamsService } from './teams.service'

@Controller()
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly imagesService: ImagesService
  ) {}

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Post('/organisations/:organisationId/teams')
  @Uploads('avatar', UploadOptions.Nullable)
  async teamCreate(
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
  @Get('/organisations/:organisationId/teams')
  teamFindAll(@Param('organisationId') organisationId: string) {
    return this.teamsService.findAll(organisationId)
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/teams/:id')
  teamFindOne(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string
  ) {
    return this.teamsService.findOne(id, organisationId)
  }

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Put('/organisations/:organisationId/teams/:id')
  @Uploads('avatar', UploadOptions.Nullable)
  async teamUpdate(
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

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Delete('/organisations/:organisationId/teams/:id')
  teamRemove(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string
  ) {
    return this.teamsService.remove(id, organisationId)
  }

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin, Roles.TeamAdmin)
  @Get('/organisations/:organisationId/teams/:teamId/users')
  findAllUsersFromTeam(
    @Param('organisationId') organisationId: string,
    @Param('teamId') teamId: string
  ) {
    return this.teamsService.getAllUsersFromTeam(organisationId, teamId)
  }

  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin, Roles.TeamAdmin)
  @Delete('/organisations/:organisationId/teams/:teamId/users/:userId')
  deleteUserFromTeam(
    @Param('organisationId') organisationId: string,
    @Param('teamId') teamId: string,
    @Param('userId') userId: string
  ) {
    return this.teamsService.deleteUserFromTeam(organisationId, teamId, userId)
  }

  @Post('/teams/join')
  userJoinTeam(@Body('token') token: string, @User() user: AuthenticatedUser) {
    return this.teamsService.joinTeam(token, user)
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
}
