import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Response
} from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import {
  ShareHealthActivityImageDto,
  UpdateHealthActivityImagesDto
} from './dto/update-health-activity-images.dto'
import { UpdateHealthActivityDto } from './dto/update-health-activity.dto'
import { HealthActivitiesService } from './health-activities.service'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { plainToClass } from 'class-transformer'
import { UserPublic } from '../users/entities/user.entity'

@Controller()
export class HealthActivitiesController {
  constructor(
    private readonly healthActivitiesService: HealthActivitiesService
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

    if (healthActivity.user.id !== user.id) {
      throw new ForbiddenException()
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

    if (healthActivity.user.id !== user.id) {
      throw new ForbiddenException()
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
    return {
      ...healthActivity,
      user: plainToClass(UserPublic, healthActivity.user, {
        excludeExtraneousValues: true
      })
    }
  }

  @Post('/me/health-activities/:activityId/share')
  async generateImageShare(
    @Param('activityId') id: string,
    @Param('imageId') imageId: string,
    @Body() { image_url, stats }: ShareHealthActivityImageDto,
    @AuthUser() user: AuthenticatedUser,
    @Response() res
  ) {
    const healthActivity = await this.healthActivitiesService.findOne(id)

    if (healthActivity.user.id !== user.id) {
      throw new ForbiddenException()
    }

    const image = await this.healthActivitiesService.createShareableImage(
      stats,
      image_url
    )

    res.writeHead(200, { 'Content-Type': 'image/jpeg' })
    res.end(image, 'binary')
  }
}
