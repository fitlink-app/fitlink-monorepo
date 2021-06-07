import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { Iam } from '../../../../decorators/iam.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { Roles } from '../../../user-roles/entities/user-role.entity'
import { StravaService } from './strava.service'
import { StravaEventData } from '../../types/strava'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { User } from '../../../../decorators/authenticated-user.decorator'

@Controller('/providers/strava')
export class StravaControler {
  constructor(private stravaService: StravaService) {}

  @Public()
  @Get('/webhook')
  verifyWebhook(
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string
  ) {
    return this.verifyWebhook(token, challenge)
  }

  @Public()
  @Post('/webhook')
  webhookReceiver(@Body() stravaEventData: StravaEventData) {
    this.stravaService.processStravaData(stravaEventData)
    return { success: true }
  }

  @Get('/auth')
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.stravaService.getOAuthUrl(user.id)
  }

  @Public()
  @Get('/callback')
  oauthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('scope') scope: string
  ) {
    return this.stravaService.saveStravaProvider(code, state, scope)
  }

  @Get('revokeToken')
  deAuthorize(@User() user: AuthenticatedUser) {
    return this.stravaService.deAuthorize(user.id)
  }
}
