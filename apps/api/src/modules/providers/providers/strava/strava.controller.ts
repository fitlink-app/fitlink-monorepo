import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query
} from '@nestjs/common'
import { Iam } from '../../../../decorators/iam.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { Roles } from '../../../user-roles/entities/user-role.entity'
import { StravaService } from './strava.service'
import { StravaEventData } from '../../types/strava'

const strava_verify_token = 'daVerifyTokenIsAMyth'

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
  webhookReciever(@Body() stravaEventData: StravaEventData) {
    this.stravaService.processStravaData(stravaEventData)
    return { success: true }
  }

  @Iam(Roles.Self)
  @Get('/auth/:userId')
  getOAuthUrl(@Param('userId') userId: string) {
    return this.stravaService.getOAuthUrl(userId)
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

  @Iam(Roles.Self)
  @Get('/:userId/revokeToken')
  deAuthorize(@Param('userId') userId: string) {
    return this.stravaService.deAuthorize(userId)
  }

  @Public()
  @Get('/config')
  config() {
    return this.stravaService.stravaConfig('verify_token')
  }
}
