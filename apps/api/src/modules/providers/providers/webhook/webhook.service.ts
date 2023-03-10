import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthActivityDto } from '../../../health-activities/dto/create-health-activity.dto'
import { healthActivityType } from '../../../health-activities/dto/healthActivityType'
import { HealthActivitiesService } from '../../../health-activities/health-activities.service'
import { ProvidersService } from '../../providers.service'
import { WebhookEventActivity, WebhookEventPayload } from '../../types/webhook'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class WebhookService {
  constructor(
    private configService: ConfigService,
    private providersService: ProvidersService,
    private healthActivityService: HealthActivitiesService,
    private jwtService: JwtService,
  ) {}

  async processWebhookData(
    webhookEventData: WebhookEventPayload,
    userId: string
  ) {
    const normalized = webhookEventData.activities.map((e) => {
      return { normalized: this.createNormalizedHealthActivity(e), raw: e }
    })
    return Promise.all(
      normalized.map((activity) => {
        return this.healthActivityService.create(
          activity.normalized,
          userId,
          activity.raw
        )
      })
    )
  }

  async processNewWebhookData(
    webhookEventData: WebhookEventPayload,
  ) {
    // TODO(API): verify the token better

    // going forward we obtain the userId from the Token. Sub is the provider.id
    const decode = this.jwtService.decode(webhookEventData.token) as { sub: string };
    this.jwtService.verify(webhookEventData.token)
    const provider = await this.providersService.findOneByProviderId(decode.sub);

    if (!provider) {
      throw new HttpException('Token is invalid', HttpStatus.UNAUTHORIZED)
    }

    // we not get the userID from the Token
    const userId = provider.user.id;

    const normalized = webhookEventData.activities.map((e) => {
      return { normalized: this.createNormalizedHealthActivity(e), raw: e }
    })
    return Promise.all(
      normalized.map((activity) => {
        return this.healthActivityService.create(
          activity.normalized,
          userId,
          activity.raw
        )
      })
    )
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
