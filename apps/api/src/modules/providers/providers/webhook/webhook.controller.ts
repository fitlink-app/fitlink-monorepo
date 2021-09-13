import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { WebhookEventData } from '../../types/webhook'
import { WebhookService } from './webhook.service'

@Controller()
@ApiTags('providers')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}
  @Post('/providers/webhook')
  webhookReceiver(
    @Body() webhookEventData: WebhookEventData,
    @User() user: AuthenticatedUser
  ) {
    return this.webhookService.processWebhookData(webhookEventData, user.id)
  }
}
