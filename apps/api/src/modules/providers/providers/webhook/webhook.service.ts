import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthActivityDto } from '../../../health-activities/dto/create-health-activity.dto'
import { healthActivityType } from '../../../health-activities/dto/healthActivityType'
import { HealthActivitiesService } from '../../../health-activities/health-activities.service'
import { ProvidersService } from '../../providers.service'
import { WebhookEventActivity, WebhookEventData } from '../../types/webhook'

@Injectable()
export class WebhookService {
  constructor(
    private configService: ConfigService,
    private providersService: ProvidersService,
    private healthActivityService: HealthActivitiesService
  ) {}

  async processWebhookData(webhookEventData: WebhookEventData, userId: string) {
    const normalized = webhookEventData.activities.map((e) =>
      this.createNormalizedHealthActivity(e)
    )
    return Promise.all(
      normalized.map((activity) => {
        return this.healthActivityService.create(activity, userId)
      })
    )
  }

  createNormalizedHealthActivity({
    type,
    provider,
    start_time,
    end_time,
    calories,
    distance
  }: WebhookEventActivity): HealthActivityDto {
    const normalizedActivity: HealthActivityDto = {
      type: type as healthActivityType,
      provider,
      start_time,
      end_time,
      calories,
      distance,
      elevation: 0,
      active_time: 0
    }

    return normalizedActivity
  }
}