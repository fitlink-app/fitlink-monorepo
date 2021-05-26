import { Controller, Get, Query } from '@nestjs/common'
import { User } from 'apps/api/src/decorators/authenticated-user.decorator'
import { Public } from 'apps/api/src/decorators/public.decorator'
import { AuthenticatedUser } from 'apps/api/src/models'
import { StravaService } from './strava.service'

const client_id = '59872'
const client_secret = '657513b1852f65d2d5dac18ca08d77780e1cd5af'
const redirect_uri = 'http://localhost:3001/api/v1/providers/strava/callback'

@Controller('/providers/strava')
export class StravaControler {
  constructor(private stravaService: StravaService) {}

  @Get()
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.stravaService.getOAuthUrl({
      client_id,
      client_secret,
      redirect_uri,
      user
    })
  }

  @Public()
  @Get('/callback')
  oauthCallback(
    @Query('code') code,
    @Query('state') state,
    @Query('scope') scope
  ) {
    return this.stravaService.saveStravaProvider(code, state, scope)
  }

  @Get('/revokeToken')
  deAuthorize(@User() user: AuthenticatedUser) {
    return this.stravaService.deAuthorize(user)
  }

  @Get('/accessToken')
  getAccessToken(@User() user: AuthenticatedUser) {
    return this.stravaService.getFreshStravaAccessToken(user.id)
  }
}
