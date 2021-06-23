import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ForbiddenException
} from '@nestjs/common'
import { LeaguesInvitationsService } from './leagues-invitations.service'
import { CreateLeaguesInvitationDto } from './dto/create-leagues-invitation.dto'
import { AuthenticatedUser } from '../../models'
import { User } from '../../decorators/authenticated-user.decorator'
import { ApiBaseResponses } from '../../decorators/swagger.decorator'

@Controller()
@ApiBaseResponses()
export class LeaguesInvitationsController {
  constructor(
    private readonly leagueInvitationsService: LeaguesInvitationsService
  ) {}

  @Post('/leagues/:leagueId/invitations')
  async create(
    @Param('leagueId') leagueId: string,
    @Body() { userId }: CreateLeaguesInvitationDto,
    @User() authUser: AuthenticatedUser
  ) {
    const league = await this.leagueInvitationsService.getInvitableLeague(
      leagueId,
      authUser.id
    )
    if (!league) {
      throw new ForbiddenException(
        'You do not have permission to invite users to this league'
      )
    }

    return this.leagueInvitationsService.create(league, authUser.id, { userId })
  }
}
