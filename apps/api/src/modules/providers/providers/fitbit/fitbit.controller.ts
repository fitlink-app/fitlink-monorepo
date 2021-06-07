import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query
} from '@nestjs/common'
import { Public } from '../../../../decorators/public.decorator'
import { FitbitService } from './fitbit.service'
import { Roles } from '../../../user-roles/entities/user-role.entity'
import { Iam } from '../../../../decorators/iam.decorator'
import { FitbitEventData } from '../../types/fitbit'

@Controller('/providers/fitbit')
export class FitbitController {
  constructor(private fitbitService: FitbitService) {}

  @Public()
  @HttpCode(204)
  @Post('/webhook')
  webhookReciever(@Body() fitbitEventData: FitbitEventData[]) {
    return this.fitbitService.proccessPayload(fitbitEventData)
  }

  @Public()
  @HttpCode(204)
  @Get('/webhook')
  verifyWebhook(@Query('verify') verify: string) {
    return this.fitbitService.verifyWebhook(verify)
  }

  @Get('/auth/:userId')
  @Iam(Roles.Self)
  getOAuthUrl(@Param('userId') userId: string) {
    return this.fitbitService.getOAuthUrl(userId)
  }

  @Public()
  @Get('/callback')
  oauthCallback(@Query('code') code, @Query('state') state) {
    return this.fitbitService.saveFitbitProvider(code, state)
  }

  @Get(':userId/revokeToken')
  @Iam(Roles.Self)
  deAuthorize(@Param('userId') userId: string) {
    return this.fitbitService.deAuthorize(userId)
  }
}
