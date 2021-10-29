import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Response
} from '@nestjs/common'
import {
  ShareHealthActivityImageDto,
  UpdateHealthActivityImagesDto
} from './dto/update-health-activity-images.dto'
import { HealthActivitiesService } from './health-activities.service'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'
import { ImagesService } from '../images/images.service'
import * as http from 'http'
import { CommonService } from '../common/services/common.service'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'

@ApiBaseResponses()
@Controller()
export class HealthActivitiesController {
  constructor(
    private readonly healthActivitiesService: HealthActivitiesService,
    private readonly commonService: CommonService
  ) {}

  @Get('/me/health-activities')
  findAll(@AuthUser() user: AuthenticatedUser) {
    return this.healthActivitiesService.findAll(user.id)
  }

  @Post('/me/health-activities/:activityId/images')
  async addImages(
    @Param('activityId') id: string,
    @Body() { images }: UpdateHealthActivityImagesDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    const healthActivity = await this.healthActivitiesService.findOne(id)

    if (healthActivity && healthActivity.user.id !== user.id) {
      throw new ForbiddenException()
    } else if (!healthActivity) {
      throw new NotFoundException()
    }

    return this.healthActivitiesService.setHealthActivityImages(id, images)
  }

  @Delete('/me/health-activities/:activityId/images/:imageId')
  async removeImage(
    @Param('activityId') id: string,
    @Param('imageId') imageId: string,
    @AuthUser() user: AuthenticatedUser
  ) {
    const healthActivity = await this.healthActivitiesService.findOne(id)

    if (healthActivity && healthActivity.user.id !== user.id) {
      throw new ForbiddenException()
    } else if (!healthActivity) {
      throw new NotFoundException()
    }

    return this.healthActivitiesService.removeHealthActivityImage(id, imageId)
  }

  @Get('/health-activities/:id')
  async findOne(@Param('id') id: string) {
    const healthActivity = await this.healthActivitiesService.findOne(id, [
      'user',
      'images',
      'sport'
    ])

    if (!healthActivity) {
      throw new NotFoundException()
    }
    return {
      ...healthActivity,
      user: this.commonService.getUserPublic(healthActivity.user)
    }
  }

  @Post('/me/health-activities/:activityId/share')
  async generateImageShare(
    @Param('activityId') id: string,
    @Body() requestBody: ShareHealthActivityImageDto,
    @AuthUser() user: AuthenticatedUser,
    @Response() reply: { raw: http.ServerResponse }
  ) {
    const healthActivity = await this.healthActivitiesService.findOne(id)
    const body = requestBody || {}

    if (healthActivity.user.id !== user.id) {
      throw new ForbiddenException()
    }

    const generatedImage = await this.healthActivitiesService.createShareableImage(
      id,
      body.imageId
    )

    reply.raw.writeHead(200, { 'Content-Type': 'image/jpeg' })
    reply.raw.end(generatedImage, 'binary')
  }

  @Iam(Roles.SuperAdmin)
  @Get('/health-activities-debug')
  async findAllDebugActivities(@Pagination() pagination: PaginationQuery) {
    return this.healthActivitiesService.findAllDebugActivities(pagination)
  }
}
