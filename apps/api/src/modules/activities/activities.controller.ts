import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException
} from '@nestjs/common'
import { ActivitiesIminService } from './activities.imin.service'
import { ActivitiesService } from './activities.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import {
  FindActivitiesDto,
  FindActivitiesForMapDto
} from './dto/find-activities.dto'
import { Pagination, PaginationQuery } from '../../helpers/paginate'
import { Activity, ActivityForMap } from './entities/activity.entity'
import { Public } from '../../decorators/public.decorator'
import { ApiTags } from '@nestjs/swagger'
import { IminServiceParams } from './types/imin'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'
import { User } from '../../decorators/authenticated-user.decorator'
import { Pagination as PaginationParams } from '../../decorators/pagination.decorator'
import { AuthenticatedUser } from '../../models'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { ActivityGlobalFilterDto } from './dto/filter-activities.dto'

// @Public()
@ApiBaseResponses()
@ApiTags('activities')
@Controller()
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly activitiesIminService: ActivitiesIminService
  ) {}
  @Post('/activities')
  async create(
    @User() user: AuthenticatedUser,
    @Body() dto: CreateActivityDto
  ) {
    let userId = user.id
    if (user.isSuperAdmin()) {
      userId = null
    }
    return this.activitiesService.create(userId, dto)
  }

  @Iam(Roles.OrganisationAdmin)
  @Post('/organisations/:organisationId/activities')
  async createForOrganisation(
    @Param('organisationId') organisationId: string,
    @Body() dto: CreateActivityDto
  ) {
    return this.activitiesService.create(null, dto, {
      organisationId
    })
  }

  @Iam(Roles.TeamAdmin)
  @Post('/teams/:teamId/activities')
  async createForTeam(
    @Param('teamId') teamId: string,
    @Body() dto: CreateActivityDto
  ) {
    return this.activitiesService.create(null, dto, {
      teamId
    })
  }

  /**
   * Finds activities created by a particular user (legacy Firebase user)
   *
   * @param queryParams
   * @returns
   */
  @ApiTags('me')
  @Get('/me/activities')
  async findUserActivities(
    @User() user: AuthenticatedUser,
    @PaginationParams() pagination: PaginationQuery
  ) {
    return this.activitiesService.findUserActivities(user.id, pagination)
  }

  /**
   * Finds activities based on coordinates
   * for the map display.
   *
   * @param queryParams
   * @returns
   */
  @Get('/activities/map')
  async findAllForMap(
    @User() user: AuthenticatedUser,
    @Query()
    {
      geo_radial,
      with_imin = '1',
      type = '',
      keyword = ''
    }: FindActivitiesForMapDto
  ): Promise<Pagination<ActivityForMap>> {
    // Get local activities
    const all = await this.activitiesService.findAllMarkers(
      user.id,
      geo_radial,
      type,
      keyword
    )

    if (
      with_imin === '1' &&
      geo_radial &&
      (type === '' || type.indexOf('class') > -1)
    ) {
      // Get Imin activities
      const params: IminServiceParams = {
        'geo[radial]': geo_radial,
        mode: 'discovery-geo',
        page: 0,
        limit: 50
      }

      if (keyword !== '') {
        params['organizerName[textSearch]'] = keyword
      }

      const imin = await this.activitiesIminService.findAllMarkers(params)
      const results = all.results.concat(imin.results)
      const total = all.results.length + imin.results.length

      return {
        results,
        total,
        page_total: total
      }
    } else {
      return all
    }
  }

  /**
   * Finds all global activities (for admin dashboard)
   * Activities that don't belong to a team or organisation
   * but may be created by a user.
   *
   * @param queryParams
   * @returns
   */
  @Iam(Roles.SuperAdmin)
  @Get('/activities/global')
  async findAllGlobalActivities(
    @PaginationParams() pagination: PaginationQuery,
    @Query() filters: ActivityGlobalFilterDto
  ) {
    return this.activitiesService.findAllGlobal(pagination, filters)
  }

  /**
   * Finds all activities within an organisation
   *
   * @param queryParams
   * @returns
   */
  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/activities')
  async findAllOrganisationActivities(
    @PaginationParams() pagination: PaginationQuery,
    @Param('organisationId') organisationId: string
  ) {
    return this.activitiesService.findAllGlobal(
      pagination,
      {},
      {
        organisationId
      }
    )
  }

  /**
   * Finds all activities within a team
   *
   * @param queryParams
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/activities')
  async findAllTeamActivities(
    @PaginationParams() pagination: PaginationQuery,
    @Param('teamId') teamId: string
  ) {
    return this.activitiesService.findAllGlobal(
      pagination,
      {},
      {
        teamId
      }
    )
  }

  /**
   * Finds activities based on coordinates
   * or alternatively returns activities by created date
   *
   * @param queryParams
   * @returns
   */
  @Get('/activities')
  async findAll(
    @User() user: AuthenticatedUser,
    @Query()
    {
      geo_radial,
      with_imin = '1',
      type = '',
      keyword = '',
      page,
      limit
    }: FindActivitiesDto
  ) {
    const intPage = parseInt(page) || 0
    const intLimit = parseInt(limit) || 10

    // Get local activities
    const all = await this.activitiesService.findAll(
      user.id,
      geo_radial,
      type,
      keyword,
      {
        page: intPage,
        limit: intLimit
      }
    )

    if (
      with_imin === '1' &&
      geo_radial &&
      (type === '' || type.indexOf('class') > -1)
    ) {
      // Get Imin activities
      const params: IminServiceParams = {
        'geo[radial]': geo_radial,
        mode: 'discovery-geo',
        page: intPage,
        limit: intLimit
      }

      if (keyword !== '') {
        params['organizerName[textSearch]'] = keyword
      }

      const imin = await this.activitiesIminService.findAll(params)

      return ActivitiesController.mergeAndPaginate(all, imin, {
        page: intPage,
        limit: intLimit
      })
    } else {
      return all
    }
  }

  @Get('/activities/:id')
  findOne(@User() user: AuthenticatedUser, @Param('id') id: string) {
    if (id.length === 36) {
      if (user.isSuperAdmin()) {
        return this.activitiesService.findOne(id)
      }
      return this.activitiesService.findOne(id, user.id)
    } else {
      return this.activitiesIminService.findOne(id)
    }
  }

  @Put('/activities/:id')
  async update(
    @User() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    if (user.isSuperAdmin()) {
      return this.activitiesService.update(id, updateActivityDto)
    } else {
      const activity = this.activitiesService.findOneUserActivity(id, user.id)
      if (activity) {
        return this.activitiesService.update(id, updateActivityDto)
      } else {
        throw new ForbiddenException(
          'You do not have access to update this activity'
        )
      }
    }
  }

  @Iam(Roles.OrganisationAdmin)
  @Put('/organisations/:organisationId/activities/:id')
  async updateForOrganisation(
    @Param('id') id: string,
    @Param('organisationId') organisationId: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    return this.activitiesService.update(id, updateActivityDto, {
      organisationId
    })
  }

  @Iam(Roles.TeamAdmin)
  @Put('/teams/:teamId/activities/:id')
  async updateForTeam(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    return this.activitiesService.update(id, updateActivityDto, {
      teamId
    })
  }

  @Delete('/activities/:id')
  remove(@User() user: AuthenticatedUser, @Param('id') id: string) {
    if (user.isSuperAdmin()) {
      return this.activitiesService.remove(id)
    } else {
      const activity = this.activitiesService.findOneUserActivity(id, user.id)
      if (activity) {
        return this.activitiesService.remove(id)
      } else {
        throw new ForbiddenException(
          'You do not have access to update this activity'
        )
      }
    }
  }

  static mergeAndPaginate(
    all: Pagination<Activity>,
    imin: Pagination<Activity>,
    { page = 0, limit = 20 }
  ) {
    const pageTotal = all.page_total + imin.page_total
    const results = all.results.concat(imin.results)
    const total = all.total + imin.total
    let remaining = total

    if (all.page_total === 0) {
      remaining = imin.total - page * limit * 2 - imin.page_total
      if (remaining < 0) {
        remaining = 0
      }
    } else {
      remaining = total - page * limit * 2 - all.page_total - imin.page_total
    }

    return {
      total,
      page_total: pageTotal,
      results,
      remaining
    }
  }
}
