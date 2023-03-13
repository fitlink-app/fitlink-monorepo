import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiBaseResponses } from '../../../../decorators/swagger.decorator'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { WebhookEventPayload } from '../../types/webhook'
import { WebhookService } from './webhook.service'
import { FitlinkersGuard } from '../../../../guards/fitlinkers.guard'

@Controller()
@ApiTags('providers')
@ApiBaseResponses()
export class WebhookController {
  constructor(private webhookService: WebhookService) {}
  @UseGuards(FitlinkersGuard)
  @Post('/providers/webhook')
  webhookReceiver(
    @Body() webhookEventData: WebhookEventPayload,
    @User() user: AuthenticatedUser
  ) {
    return this.webhookService.processWebhookData(webhookEventData, user.id)
  }

  @UseGuards(FitlinkersGuard)
  @Post('/providers/webhook/new')
  newWebhookReceiver(
    @Body() webhookEventData: WebhookEventPayload,
  ) {
    return this.webhookService.processNewWebhookData(webhookEventData)
  }
}
