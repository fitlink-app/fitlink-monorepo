import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  Response
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiBaseResponses } from '../../../../decorators/swagger.decorator'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { StravaEventData } from '../../types/strava'
import { OauthUrl } from './strava.dto'
import { StravaService } from './strava.service'
import { ClientIdParam } from '../../../client-id/client-id.decorator'
import { ClientIdType } from '../../../client-id/client-id.constant'

@Controller('/providers/strava')
@ApiTags('providers')
@ApiBaseResponses()
export class StravaControler {
  constructor(private stravaService: StravaService) {}

  @Public()
  @Get('/webhook')
  verifyWebhook(
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @ClientIdParam() clientId: ClientIdType
  ) {
    return this.stravaService.verifyWebhook(token, challenge, clientId)
  }

  @Get('/webhook/view')
  readWebhook(@ClientIdParam() clientId: ClientIdType) {
    return this.stravaService.viewWebhook(clientId)
  }

  @Post('/webhook/register')
  registerWebhook(@ClientIdParam() clientId: ClientIdType) {
    return this.stravaService.registerWebhook(clientId)
  }

  @Delete('/webhook/register/:id')
  deregisterWebhook(@Param('id') id: string, @ClientIdParam() clientId: ClientIdType) {
    return this.stravaService.deregisterWebhook(id, clientId)
  }

  @Public()
  @Post('/webhook')
  webhookReceiver(@Body() stravaEventData: StravaEventData, @ClientIdParam() clientId: ClientIdType) {
    console.info('stravaEventData', stravaEventData);
    return this.stravaService.processStravaData(stravaEventData, clientId)
  }

  @ApiResponse({ type: OauthUrl, status: 200 })
  @Get('/auth')
  getOAuthUrl(@User() user: AuthenticatedUser, @ClientIdParam() clientId: ClientIdType) {
    return this.stravaService.getOAuthUrl(user.id, clientId)
  }

  @Public()
  @Get('/callback')
  async oauthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('scope') scope: string,
    @Res() res,
  ) {
    try {
      const { userId, client_id } = JSON.parse(decodeURIComponent(state));

      await this.stravaService.saveStravaProvider(code, userId, scope, client_id)
      res.status(302).redirect('fitlink-app://provider/strava/auth-success')
    } catch (e) {
      res.status(302).redirect('fitlink-app://provider/strava/auth-fail')
    }
  }

  @Delete()
  deAuthorize(@User() user: AuthenticatedUser, @ClientIdParam() clientId: ClientIdType) {
    return this.stravaService.deAuthorize(user.id, clientId)
  }
}
