import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { ProvidersService } from '../providers/providers.service'
import { Sport } from '../sports/entities/sport.entity'
import { CreateHealthActivityDto } from './dto/create-health-activity.dto'
import { UpdateHealthActivityDto } from './dto/update-health-activity.dto'
import { HealthActivity } from './entities/health-activity.entity'
import { HealthActivityCreatedEvent } from './events/health-activity-created.event'

@Injectable()
export class HealthActivitiesService {
  constructor(
    @InjectRepository(HealthActivity)
    private healthActivityRepository: Repository<HealthActivity>,

    @InjectRepository(Sport)
    private sportsRepository: Repository<Sport>,
    private providersService: ProvidersService,
    private eventEmitter: EventEmitter2
  ) {}

  async create(activity: CreateHealthActivityDto, userId: string) {
    const {
      end_time,
      start_time,
      active_time,
      distance,
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
    type == 'unknown' && console.error('Sport not registered')
    const sport = await this.sportsRepository.findOne({
      where: { name_key: type }
    })
    if (!sport) {
      console.error('Sport doesnt exist')
    }
    const isDuplicate = await this.isActivityOverlapping(
      start_time,
      end_time,
      userId
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
            distance: distance || 0,
            elevation: elevation || 0,
            quantity: quantity || 0,
            stairs: elevation || 0,
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
        'health_activity.created',
        healthActivityCreatedEvent
      )
      return newHealthActivity
    } else {
      return { healthActivity: null }
    }
  }

  calculatePoints(calories: number) {
    return Math.ceil(calories / 100) || 1
  }

  async isActivityOverlapping(
    startTime: string,
    endTime: string,
    userId: string
  ) {
    const [userActivities, error] = await tryAndCatch(
      this.healthActivityRepository.findOne({
        where: {
          user: { id: userId },
          start_time: LessThanOrEqual(new Date(endTime)),
          end_time: MoreThanOrEqual(new Date(startTime))
        }
      })
    )
    error && error.message !== 'Data not found' && console.error(error.message)
    return !!userActivities
  }

  findAll() {
    return `This action returns all healthActivities`
  }

  findOne(id: number) {
    return `This action returns a #${id} healthActivity`
  }

  update(id: number, updateHealthActivityDto: UpdateHealthActivityDto) {
    return `This action updates a #${id} healthActivity`
  }

  remove(id: number) {
    return `This action removes a #${id} healthActivity`
  }
}
