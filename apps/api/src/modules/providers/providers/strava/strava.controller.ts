import { Controller, Get, Param, Query } from '@nestjs/common'
import { Iam } from '../../../../decorators/iam.decorator'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { AuthenticatedUser } from '../../../../models'
import { Roles } from '../../../user-roles/entities/user-role.entity'
import { StravaService } from './strava.service'

@Controller('/providers/strava')
export class StravaControler {
  constructor(private stravaService: StravaService) {}

  @Iam(Roles.Self)
  @Get(':userId')
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.stravaService.getOAuthUrl(user)
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
