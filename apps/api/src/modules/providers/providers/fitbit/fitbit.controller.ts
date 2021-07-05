import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common'
import { Public } from '../../../../decorators/public.decorator'
import { FitbitService } from './fitbit.service'
import { FitbitEventData } from '../../types/fitbit'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { ApiTags } from '@nestjs/swagger'

@Controller('/providers/fitbit')
@ApiTags('providers')
export class FitbitController {
  constructor(private fitbitService: FitbitService) {}

  @Public()
  @HttpCode(204)
  @Post('/webhook')
  webhookReceiver(@Body() fitbitEventData: FitbitEventData[]) {
    return this.fitbitService.processPayload(fitbitEventData)
  }

  @Public()
  @HttpCode(204)
  @Get('/webhook')
  verifyWebhook(@Query('verify') verify: string) {
    return this.fitbitService.verifyWebhook(verify)
  }

  @Get('/auth')
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.fitbitService.getOAuthUrl(user.id)
  }

  @Public()
  @Get('/callback')
  oauthCallback(@Query('code') code, @Query('state') state) {
    return this.fitbitService.saveFitbitProvider(code, state)
  }

  @Get('/revokeToken')
  deAuthorize(@User() user: AuthenticatedUser) {
    return this.fitbitService.deAuthorize(user.id)
  }
}
