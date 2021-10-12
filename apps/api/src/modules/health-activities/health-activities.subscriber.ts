import { Injectable } from '@nestjs/common'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  Repository
} from 'typeorm'
import { Sport } from '../sports/entities/sport.entity'
import { User } from '../users/entities/user.entity'
import { HealthActivity } from './entities/health-activity.entity'
import { HealthActivitiesService } from './health-activities.service'

@Injectable()
@EventSubscriber()
export class HealthActivitiesSubscriber
  implements EntitySubscriberInterface<HealthActivity> {
  constructor(
    connection: Connection,
    private healthActivitiesService: HealthActivitiesService
  ) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return HealthActivity
  }

  async beforeInsert(event: InsertEvent<HealthActivity>) {
    await this.updateTitle(event)
  }

  async updateTitle({ manager, entity }: InsertEvent<HealthActivity>) {
    const sportsRepository = manager.getRepository(Sport)
    const userRepository = manager.getRepository(User)
    const sport = await sportsRepository.findOne(entity.sport.id)
    const user = await userRepository.findOne(entity.user.id)

    // The entity title is sometimes provided (e.g. by Strava)
    if (!entity.title) {
      entity.title = this.healthActivitiesService.getComputedTitle(
        sport.singular,
        new Date(entity.start_time),
        user.timezone
      )
    }
  }
}
