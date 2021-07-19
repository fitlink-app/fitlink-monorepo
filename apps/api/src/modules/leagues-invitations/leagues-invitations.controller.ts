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
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { PaginationQuery } from '../../helpers/paginate'
import { Pagination } from '../../decorators/pagination.decorator'
import { LeagueInvitationPagination } from './entities/leagues-invitation.entity'

@Controller()
@ApiTags('leagues')
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

  @ApiTags('me')
  @Get('/me/league-invitations')
  @ApiResponse({ type: LeagueInvitationPagination, status: 200 })
  async myInvitations(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    const invitations = await this.leagueInvitationsService.findAll(
      {
        to_user: { id: authUser.id }
      },
      pagination
    )

    return invitations
  }
}
