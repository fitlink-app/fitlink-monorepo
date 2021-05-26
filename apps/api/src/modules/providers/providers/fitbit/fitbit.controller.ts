import { Controller, Get, Query } from '@nestjs/common'
import { User } from 'apps/api/src/decorators/authenticated-user.decorator'
import { Public } from 'apps/api/src/decorators/public.decorator'
import { AuthenticatedUser } from 'apps/api/src/models'
import { FitbitService } from './fitbit.service'

@Controller('/providers/fitbit')
export class FitbitController {
  constructor(private fitbitService: FitbitService) {}

  @Get()
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.fitbitService.getOAuthUrl(user.id)
  }

  @Public()
  @Get('/callback')
  oauthCallback(@Query('code') code, @Query('state') state) {
    console.log(code)
    return this.fitbitService.saveFitbitProvider(code, state)
  }

  @Get('/accessToken')
  getAccessToken(@User() user: AuthenticatedUser) {
    return this.fitbitService.getFreshFitbitToken(user.id)
  }

  @Get('/revokeToken')
  deAuthorize(@User() user: AuthenticatedUser) {
    return this.fitbitService.deAuthorize(user.id)
  }
}
