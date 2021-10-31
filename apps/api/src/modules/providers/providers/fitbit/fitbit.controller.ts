import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Param,
  NotFoundException,
  Response,
  Delete,
  Res
} from '@nestjs/common'
import { Public } from '../../../../decorators/public.decorator'
import { FitbitService } from './fitbit.service'
import { FitbitEventData } from '../../types/fitbit'
import { AuthenticatedUser } from '../../../../models/authenticated-user.model'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiBaseResponses } from '../../../../decorators/swagger.decorator'
import { OauthUrl } from '../fitbit/fitbit.dto'

@Controller('/providers/fitbit')
@ApiTags('providers')
@ApiBaseResponses()
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
  @Post('/webhook/:type')
  verifyWebhook(@Query('verify') verify: string, @Param('type') type: string) {
    if (!this.fitbitService.verifyWebhook(verify, type)) {
      throw new NotFoundException()
    }
    return true
  }

  @ApiResponse({ type: OauthUrl, status: 200 })
  @Get('/auth')
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.fitbitService.getOAuthUrl(user.id)
  }

  @Public()
  @Get('/callback')
  async oauthCallback(@Query('code') code, @Query('state') state, @Res() res) {
    try {
      await this.fitbitService.saveFitbitProvider(code, state)
      res.status(302).redirect('fitlink-app://provider/fitbit/auth-success')
    } catch (e) {
      res.status(302).redirect('fitlink-app://provider/fitbit/auth-fail')
    }
  }

  @Delete()
  deAuthorize(@User() user: AuthenticatedUser) {
    return this.fitbitService.deAuthorize(user.id)
  }
}
