import { Controller, Get, Param, Query } from '@nestjs/common'
import { AuthenticatedUser } from '../../../../models'
import { User } from '../../../../decorators/authenticated-user.decorator'
import { Public } from '../../../../decorators/public.decorator'
import { FitbitService } from './fitbit.service'
import { Roles } from '../../../user-roles/entities/user-role.entity'
import { Iam } from '../../../../decorators/iam.decorator'

@Controller('/providers/fitbit')
export class FitbitController {
  constructor(private fitbitService: FitbitService) {}

  @Get(':userId')
  @Iam(Roles.Self)
  getOAuthUrl(@User() user: AuthenticatedUser) {
    return this.fitbitService.getOAuthUrl(user.id)
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
