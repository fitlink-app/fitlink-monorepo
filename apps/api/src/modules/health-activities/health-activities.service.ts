import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { Events } from '../../events'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { Image } from '../images/entities/image.entity'
import { ProvidersService } from '../providers/providers.service'
import { Sport } from '../sports/entities/sport.entity'
import { CreateHealthActivityDto } from './dto/create-health-activity.dto'
import { HealthActivity } from './entities/health-activity.entity'
import { HealthActivityCreatedEvent } from './events/health-activity-created.event'
import { ShareableImageStat } from './health-activities.constants'
import shareActivityTemplate from './health-activities.image-template'
import * as nodeHtmlToImage from 'node-html-to-image'
import { ImagesService } from '../images/images.service'
import { Pagination, PaginationQuery } from '../../helpers/paginate'
import { differenceInSeconds } from 'date-fns'
import { zonedFormat } from '../../../../common/date/helpers'
import {
  formatDurationShort,
  getActivityDistance,
  getSpeedValue
} from '../../../../common/metrics'
import { HealthActivityDebug } from './entities/health-activity-debug.entity'
import { User } from '../../modules/users/entities/user.entity'

type DebugArguments = {
  raw: NodeJS.Dict<any>
  processed: CreateHealthActivityDto
  userId: string
  log: string[]
}

@Injectable()
export class HealthActivitiesService {
  constructor(
    @InjectRepository(HealthActivity)
    private healthActivityRepository: Repository<HealthActivity>,

    @InjectRepository(HealthActivityDebug)
    private debugRepository: Repository<HealthActivityDebug>,

    @InjectRepository(Sport)
    private sportsRepository: Repository<Sport>,
    private providersService: ProvidersService,
    private eventEmitter: EventEmitter2,
    private imagesService: ImagesService
  ) {}

  async debug({ raw, processed, userId, log }: DebugArguments) {
    const user = new User()
    user.id = userId

    return this.debugRepository.save({
      raw: raw,
      processed: processed,
      user: user,
      log: log
    })
  }

  async create(
    activity: CreateHealthActivityDto,
    userId: string,
    raw: NodeJS.Dict<any>
  ) {
    const {
      end_time,
      start_time,
      active_time,
      distance,
      utc_offset,
      elevation,
      quantity,
      provider,
      type,
      polyline
    } = activity

    // Get the users's provider
    const [userProvider, userProviderErr] = await tryAndCatch(
      this.providersService.findOne(userId, provider)
    )

    userProviderErr && console.error('User provider not found')
    type === 'unknown' && console.error('Sport not registered')

    if (userProviderErr || type === 'unknown') {
      const log = userProviderErr
        ? [`User provider ${provider} not found`]
        : ['Sport not registered']

      await this.debug({
        userId,
        raw,
        processed: activity,
        log
      })

      return { healthActivity: null, log }
    }

    const sport = await this.sportsRepository.findOne({
      where: { name_key: type }
    })
    if (!sport) {
      console.error('Sport doesnt exist')
    }
    const isDuplicate = await this.isActivityOverlapping(
      start_time,
      end_time,
      userId,
      sport
    )
    isDuplicate && console.error('Activity is overlapping')

    if (!isDuplicate && sport) {
      let calories = activity.calories
      if (!calories) {
        if (activity.distance) {
          // 1km = ~62 kcal
          calories = (activity.distance / 1000) * 62
        }
      }
      const [newHealthActivity, newHealthActivityErr] = await tryAndCatch(
        this.healthActivityRepository.save(
          this.healthActivityRepository.create({
            end_time,
            active_time,
            calories,
            start_time,
            utc_offset,
            distance: distance || 0,
            elevation: elevation || 0,
            quantity: quantity || 0,
            stairs: Math.floor(elevation) || 0, // Stairs is int only
            provider: userProvider,
            polyline: polyline || '',
            sport,
            points: this.calculatePoints(calories),
            user: { id: userId }
          })
        )
      )
      newHealthActivityErr && console.error(newHealthActivityErr.message)
      const healthActivityCreatedEvent = new HealthActivityCreatedEvent()
      healthActivityCreatedEvent.health_activity_id = newHealthActivity.id
      await this.eventEmitter.emitAsync(
        Events.HEALTH_ACTIVITY_CREATED,
        healthActivityCreatedEvent
      )
      return newHealthActivity as HealthActivity
    } else {
      let log = ['Duplicate']
      if (!isDuplicate) {
        log = [`Sport ${type} not registered`]
        await this.debug({
          userId,
          raw,
          processed: activity,
          log
        })
      }
      return { healthActivity: null, log }
    }
  }

  calculatePoints(calories: number) {
    return Math.ceil(calories / 100) || 1
  }

  async isActivityOverlapping(
    startTime: string,
    endTime: string,
    userId: string,
    sport?: Sport
  ) {
    const activity = await this.healthActivityRepository.findOne({
      where: {
        user: { id: userId },
        start_time: LessThanOrEqual(new Date(endTime)),
        end_time: MoreThanOrEqual(new Date(startTime)),
        sport: {
          id: sport ? sport.id : undefined
        }
      }
    })
    if (activity) {
      console.log(
        `${activity.id} ${userId} ${sport ? sport.name_key : 'Sport not found'}`
      )
    }
    return !!activity
  }

  setHealthActivityImages(healthActivityId: string, images: string | string[]) {
    return this.healthActivityRepository
      .createQueryBuilder()
      .relation(HealthActivity, 'images')
      .of(healthActivityId)
      .add(images)
  }

  removeHealthActivityImage(healthActivityId: string, imageId: string) {
    return this.healthActivityRepository
      .createQueryBuilder()
      .relation(HealthActivity, 'images')
      .of(healthActivityId)
      .remove(imageId)
  }

  async findAll(
    userId: string,
    relations: string[] = ['user', 'images', 'sport']
  ) {
    const [results, total] = await this.healthActivityRepository.findAndCount({
      where: {
        user: {
          id: userId
        }
      },
      relations
    })

    return new Pagination<HealthActivity>({
      results,
      total
    })
  }

  findOne(id: string, relations: string[] = ['user']) {
    return this.healthActivityRepository.findOne(id, {
      relations
    })
  }

  getComputedTitle(singular: string, start_time: Date, tz: string) {
    const hour = Number(zonedFormat(start_time, 'H', tz, {}))
    let time = 'Early morning'

    if (hour >= 7 && hour < 12) {
      time = 'Morning'
    }

    if (hour >= 12 && hour <= 13) {
      time = 'Midday'
    }

    if (hour >= 13) {
      time = 'Afternoon'
    }

    if (hour >= 16) {
      time = 'Evening'
    }

    if (hour >= 20 || hour < 4) {
      time = 'Late evening'
    }

    return `${time} ${singular}`
  }

  async createShareableImage(healthActivityId: string, imageId?: string) {
    const healthActivity = await this.healthActivityRepository.findOne(
      healthActivityId,
      {
        relations: ['user', 'sport', 'images', 'user.avatar']
      }
    )

    if (!healthActivity) {
      return false
    }

    let image = healthActivity.images.filter((e) => e.id == imageId)[0]
    let imageUrl: string

    if (!image) {
      image = healthActivity.user.avatar
      imageUrl = healthActivity.sport.image_url || image.url
    } else {
      imageUrl = image.url
    }

    // If there's still no image available we can't proceed
    if (!imageUrl) {
      return false
    }

    const formattedStats = await this.getHealthActivityStatsFormatted(
      healthActivity
    )

    return await (nodeHtmlToImage as any)({
      type: 'jpeg',
      quality: 95,
      html: shareActivityTemplate,
      content: {
        imageUrl,
        stats: formattedStats,
        title: healthActivity.title
      }
    })
  }

  async getHealthActivityStatsFormatted(healthActivity: HealthActivity) {
    const unitSystem = healthActivity.user.unit_system
    const durationInSeconds =
      healthActivity.active_time ||
      differenceInSeconds(healthActivity.end_time, healthActivity.start_time)
    const stats: ShareableImageStat[] = []

    // DISTANCE
    if (!!healthActivity?.distance) {
      const value = getActivityDistance(unitSystem, healthActivity.distance, {
        short: true
      }) as string

      stats.push({
        value,
        label: 'DISTANCE'
      })
    }

    // TIME
    stats.push({
      value: formatDurationShort(durationInSeconds),
      label: 'TIME'
    })

    // SPEED
    if (!!healthActivity?.distance) {
      const value = getSpeedValue(
        healthActivity.sport.name_key,
        healthActivity.distance,
        durationInSeconds,
        unitSystem
      ) as string

      stats.push({
        value,
        label: healthActivity.sport.show_pace ? 'PACE' : 'SPEED'
      })
    }

    stats.push({
      value: healthActivity.points.toString(),
      label: 'POINTS'
    })

    return stats
  }

  async findAllDebugActivities({ limit, page }: PaginationQuery) {
    const [results, total] = await this.debugRepository.findAndCount({
      relations: ['user'],
      take: limit,
      skip: page * limit,
      order: { created_at: 'DESC' }
    })

    return new Pagination({
      results: results,
      total
    })
  }
}
