import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { StravaEventData } from '../../types/strava'
import { StravaService } from './strava.service'

@Controller('/providers/strava')
@ApiTags('providers')
export class StravaControler {
  constructor(private stravaService: StravaService) {}

  @Public()
  @Get('/webhook')
  verifyWebhook(
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string
  ) {
    return this.stravaService.verifyWebhook(token, challenge)
  }

  @Get('/webhook/view')
  readWebhook() {
    return this.stravaService.viewWebhook()
  }

  @Post('/webhook/register')
  registerWebhook() {
    return this.stravaService.registerWebhook()
  }

  @Delete('/webhook/register/:id')
  deregisterWebhook(@Param('id') id: string) {
    return this.stravaService.deregisterWebhook(id)
  }

  @Public()
  @Post('/webhook')
  webhookReceiver(@Body() stravaEventData: StravaEventData) {
    return this.stravaService.processStravaData(stravaEventData)
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
