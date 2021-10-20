import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '../../decorators/authenticated-user.decorator'
import { Iam } from '../../decorators/iam.decorator'
import { AuthenticatedUser } from '../../models'
import { Image } from '../images/entities/image.entity'
import { Roles } from '../user-roles/user-roles.constants'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamServiceError, TeamsService } from './teams.service'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { Team } from './entities/team.entity'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'
import { RespondTeamsInvitationDto } from '../teams-invitations/dto/respond-teams-invitation.dto'
import { TeamsInvitationsServiceError } from '../teams-invitations/teams-invitations.service'
import { JoinTeamDto } from './dto/join-team.dto'
import { Public } from '../../decorators/public.decorator'

@Controller()
@ApiTags('teams')
@ApiBaseResponses()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /**
   * Only organisation admins can create new teams
   *
   * @param createTeamDto
   * @param organisationId
   * @returns
   */
  @Iam(Roles.OrganisationAdmin, Roles.SuperAdmin)
  @Post('/organisations/:organisationId/teams')
  async teamCreate(
    @Body() createTeamDto: CreateTeamDto,
    @Param('organisationId') organisationId: string
  ) {
    const create: Partial<Team> = createTeamDto

    if (createTeamDto.imageId) {
      create.avatar = new Image()
      create.avatar.id = createTeamDto.imageId
    }

    return this.teamsService.create(create, organisationId)
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/teams')
  teamFindAll(
    @Param('organisationId') organisationId: string,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.teamsService.findAll(pagination, organisationId)
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
  async teamUpdate(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string,
    @Body() updateTeamDto: UpdateTeamDto
  ) {
    const update: Partial<Team> = updateTeamDto

    if (updateTeamDto.imageId) {
      update.avatar = new Image()
      update.avatar.id = updateTeamDto.imageId
    } else if (updateTeamDto.imageId === null) {
      update.avatar = null
    }

    return this.teamsService.update(id, update, organisationId)
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

  @Iam(Roles.TeamAdmin)
  @Delete('/teams/:teamId/users/:userId')
  deleteUserFromTeam(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string
  ) {
    return this.teamsService.deleteUserFromTeam(teamId, userId)
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/stats')
  findAllUsersAndStats(
    @Param('teamId') teamId: string,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.teamsService.queryUserTeamStats(teamId, pagination)
  }

  @Public()
  @Get('/teams/code/:code')
  @ApiResponse({ type: Team })
  async findTeamByCode(@Param('code') code: string) {
    const team = await this.teamsService.findOneByCode(code)
    if (!team) {
      throw new NotFoundException()
    }
    return team
  }

  // @Iam(Roles.TeamAdmin)
  // @Get('/teams/:teamId/stats/health-activities')
  // findTeamHealthActivities(
  //   @Param('teamId') teamId: string,
  //   @Query() { start_at, end_at }: DateQueryDto
  // ) {
  //   return this.teamsService.queryPopularActivities(teamId, {
  //     start_at,
  //     end_at
  //   })
  // }

  @Post('/teams/join')
  async userJoinTeam(
    @Body() { token, code }: JoinTeamDto,
    @User() user: AuthenticatedUser
  ) {
    if (token) {
      const join = await this.teamsService.joinTeamFromToken(token, user.id)
      if (typeof join === 'string') {
        throw new BadRequestException(join)
      }

      return join
    } else if (code) {
      const join = await this.teamsService.joinTeamFromCode(code, user.id)
      if (typeof join === 'string') {
        throw new BadRequestException(join)
      }

      return { success: join }
    } else {
      throw new BadRequestException('You must specify a join code or token')
    }
  }

  @Iam(Roles.SuperAdmin)
  @Get('/teams')
  findAll(@Pagination() pagination: PaginationQuery) {
    return this.teamsService.findAll(pagination)
  }

  @Iam(Roles.SuperAdmin, Roles.TeamAdmin)
  @Get('/teams/:teamId')
  findOne(@Param('teamId') id: string) {
    return this.teamsService.findOne(id)
  }

  @Iam(Roles.SuperAdmin, Roles.TeamAdmin)
  @Put('/teams/:teamId')
  updateOne(@Param('teamId') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto)
  }

  @Post('/teams-invitations/respond')
  async accept(
    @Body() { token, accept }: RespondTeamsInvitationDto,
    @User() user: AuthenticatedUser
  ) {
    const result = await this.teamsService.respondToInvitation(
      token,
      accept,
      user.id
    )

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    if (!result) {
      throw new BadRequestException(TeamsInvitationsServiceError.TokenNotFound)
    }

    return result
  }

  @Iam(Roles.TeamAdmin)
  @Post('/teams/:teamId/regenerate-join-code')
  async regenerateJoinCode(@Param('teamId') teamId: string) {
    return this.teamsService.updateJoinCode(teamId)
  }

  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/invite-link')
  async getInviteLink(@Param('teamId') teamId: string) {
    return this.teamsService.getInviteLink(teamId)
  }
}
