import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common'
import { ActivitiesIminService } from './activities.imin.service'
import { ActivitiesService } from './activities.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'
import {
  FindActivitiesDto,
  FindActivitiesForMapDto
} from './dto/find-activities.dto'
import { Pagination } from '../../helpers/paginate'
import { Activity, ActivityForMap } from './entities/activity.entity'
import { ImagesService } from '../images/images.service'
import { Public } from '../../decorators/public.decorator'
import { ApiTags } from '@nestjs/swagger'
import { IminServiceParams } from './types/imin'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'

// @Public()
@ApiBaseResponses()
@ApiTags('activities')
@Controller()
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly activitiesIminService: ActivitiesIminService,
    private readonly imagesService: ImagesService
  ) {}

  @Post('/activities')
  async create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto)
  }

  /**
   * Finds activities created by a particular user (legacy Firebase user)
   *
   * @param queryParams
   * @returns
   */
  @Get('/activities/user/:userId')
  async findUserActivities(@Param('userId') userId: string, @Query() query) {
    return this.activitiesService.findUserActivities(userId, {
      limit: parseInt(query.limit) || 10,
      page: parseInt(query.page) || 0
    })
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
   * Finds activities based on coordinates
   * or alternatively returns activities by created date
   *
   * @param queryParams
   * @returns
   */
  @Get('/activities')
  async findAll(
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
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id)
  }

  @Get('/activities/:userId/:id')
  findOneUserActivity(
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    return this.activitiesService.findOneUserActivity(id, userId)
  }

  @Put('/activities/:id')
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    return this.activitiesService.update(id, updateActivityDto)
  }

  @Delete('/activities/:id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id)
  }

  @Delete('/activities/:id/images')
  removeImages(@Param('id') id: string) {
    return this.activitiesService.removeImages(id, 'images')
  }

  @Delete('/activities/:id/organizer_image')
  removeOrganizerImage(@Param('id') id: string) {
    return this.activitiesService.removeImages(id, 'organizer_image')
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
