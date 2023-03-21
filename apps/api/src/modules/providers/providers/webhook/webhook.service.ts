import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthActivityDto } from '../../../health-activities/dto/create-health-activity.dto'
import { healthActivityType } from '../../../health-activities/dto/healthActivityType'
import { HealthActivitiesService } from '../../../health-activities/health-activities.service'
import { ProvidersService } from '../../providers.service'
import { WebhookEventActivity, WebhookEventPayload } from '../../types/webhook'
import { SQSDistributionSenderService } from '../../../sqs/sqs-producer.service'
import { SQSTypes } from '../../../sqs/sqs.types'
import { v4 } from 'uuid'

@Injectable()
export class WebhookService {
  constructor(
    private healthActivityService: HealthActivitiesService,
    private sqsDistributionSenderService: SQSDistributionSenderService,
  ) {}

  async processWebhookData(
    webhookEventData: WebhookEventPayload,
    userId: string
  ) {
    const normalized = webhookEventData.activities.map((e) => {
      return { normalized: this.createNormalizedHealthActivity(e), raw: e }
    })
    normalized.forEach((activity) => {
      this.sqsDistributionSenderService.sendToQueue(
        'points-' + v4(),
        SQSTypes.points,
        userId,
        {
          activity: activity.normalized,
          webhookEventActivity: activity.raw
        }
      )
    })
    return { success: true }
  }

  createNormalizedHealthActivity({
    type,
    provider,
    start_time,
    end_time,
    calories,
    utc_offset = 0,
    distance
  }: WebhookEventActivity): HealthActivityDto {
    const normalizedActivity: HealthActivityDto = {
      type: type as healthActivityType,
      provider,
      start_time,
      end_time,
      utc_offset,
      calories,
      distance,
      elevation: 0,
      active_time: 0
    }

    return normalizedActivity
  }
}
