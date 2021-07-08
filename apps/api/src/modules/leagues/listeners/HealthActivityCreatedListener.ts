import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { HealthActivityCreatedEvent } from '../../health-activities/events/health-activity-created.event'

@Injectable()
export class HealthActivityCreatedListener {
  constructor(
    @InjectRepository(HealthActivity)
    private healthActivityRepository: Repository<HealthActivity>
  ) {}

  @OnEvent('health_activity.created', { async: true })
  async updateUserPointsInLeague(payload: HealthActivityCreatedEvent) {
    const healthActivity = await this.healthActivityRepository.findOne(
      payload.health_activity_id
    )
    console.log(
      '----------------- COMING FROM LEAGUE SERVICE ----------------------'
    )
    console.log(healthActivity)
  }
}
