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
import { FindActivitiesDto } from './dto/find-activities.dto'
import { Pagination } from '../../helpers/paginate'
import { Activity } from './entities/activity.entity'
import { Files } from '../../decorators/files.decorator'
import { ImagesService } from '../images/images.service'
import { Uploads, UploadOptions } from '../../decorators/uploads.decorator'
import { Public } from '../../decorators/public.decorator'
import { AuthGuard } from '../../guards/auth.guard'
import { ApiBearerAuth } from '@nestjs/swagger'
import { Image, ImageType } from '../images/entities/image.entity'
import { IminServiceParams } from './types/imin'

@Public()
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly activitiesIminService: ActivitiesIminService,
    private readonly imagesService: ImagesService
  ) {}

  @Post()
  @Uploads('images[]', 'organizer_image', UploadOptions.Nullable)
  async create(
    @Files('images[]') activityImages: Storage.MultipartFile[],
    @Files('organizer_image') organizerImage: Storage.MultipartFile,
    @Body() createActivityDto: CreateActivityDto
  ) {
    const alt = createActivityDto.organizer_name || createActivityDto.name
    const images = await this.imagesService.createMany(
      activityImages,
      ImageType.Standard,
      {
        alt
      }
    )

    let organizer_image: Image
    if (organizerImage) {
      organizer_image = await this.imagesService.createOne(
        organizerImage,
        ImageType.Standard,
        {
          alt
        }
      )
    }

    return this.activitiesService.create({
      ...createActivityDto,
      ...{
        images,
        organizer_image
      }
    })
  }

  /**
   * Finds activities based on coordinates
   * or alternatively returns activities by created date
   *
   * @param queryParams
   * @returns
   */
  @Get()
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
        page: intPage + 1,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id)
  }

  @Uploads('images[]', 'organizer_image', UploadOptions.Nullable)
  @Put(':id')
  async update(
    @Files('images[]') activityImages: Storage.MultipartFile[],
    @Files('organizer_image') organizerImage: Storage.MultipartFile,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    const alt = updateActivityDto.organizer_name || updateActivityDto.name
    const images = await this.imagesService.createMany(
      activityImages,
      ImageType.Standard,
      {
        alt
      }
    )

    let organizer_image: Image
    if (organizerImage) {
      organizer_image = await this.imagesService.createOne(
        organizerImage,
        ImageType.Standard,
        {
          alt
        }
      )
      updateActivityDto.organizer_image = organizer_image
    }

    if (images.length) {
      updateActivityDto.images = images
    }

    return this.activitiesService.update(id, updateActivityDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id)
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
