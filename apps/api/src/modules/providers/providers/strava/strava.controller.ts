import { Controller, Get, Param, Query } from '@nestjs/common'
import { Iam } from '../../../../decorators/iam.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { Roles } from '../../../user-roles/entities/user-role.entity'
import { StravaService } from './strava.service'

@Controller('/providers/strava')
export class StravaControler {
  constructor(private stravaService: StravaService) {}

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
}
