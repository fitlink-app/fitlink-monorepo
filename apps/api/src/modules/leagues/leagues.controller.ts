import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '../../decorators/authenticated-user.decorator'
import { Iam } from '../../decorators/iam.decorator'
import {
  ApiBaseResponses,
  DeleteResponse,
  PaginationBody,
  SuccessResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { AuthenticatedUser } from '../../models'
import { Roles } from '../user-roles/user-roles.constants'
import { CreateLeagueDto, RewardBfitDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { SearchLeagueDto } from './dto/search-league.dto'
import {
  JoinPrivateLeagueDto,
  JoinPrivateLeagueResultDto
} from './dto/join-private-league.dto'
import {
  League,
  LeaguePublic,
  LeaguePublicPagination
} from './entities/league.entity'
import { LeagueAccess } from './leagues.constants'

import { LeaguesService } from './leagues.service'
import { LeaguesInvitationsService } from '../leagues-invitations/leagues-invitations.service'
import { Pagination } from '../../decorators/pagination.decorator'
import { UserPublicPagination } from '../users/entities/user.entity'
import { SearchUserForLeaguesDto } from '../users/dto/search-user.dto'
import { ConfigService } from '@nestjs/config'
import { LeagueJobDto } from './dto/league-job.dto'
import { Public } from '../../decorators/public.decorator'
import { ClaimLeagueBfitDto } from './dto/claim-league-bfit.dto'
import { LeaguesFiltersDto } from './dto/league-filter.dto'
import { FilterCompeteToEarnDto } from './dto/filter-compete-to-earn.dto'

@ApiTags('leagues')
@ApiBaseResponses()
@Controller()
export class LeaguesController {
  constructor(
    private readonly leaguesService: LeaguesService,
    private readonly leaguesInvitationsService: LeaguesInvitationsService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 1. Anyone can create a private league
   * 2. Only superadmin can create a public league
   * All other scenarios are handled by nested routes (e..g /team/ /organisation/ routes)
   *
   * @param createLeagueDto
   * @returns
   */
  @Post('/leagues')
  @ApiTags('leagues')
  @ApiResponse({ type: League, status: 201 })
  create(
    @Body() createLeagueDto: CreateLeagueDto,
    @User() authUser: AuthenticatedUser
  ) {
    // A non-superadmin tries to create a public league
    if (
      createLeagueDto.access !== LeagueAccess.Private &&
      !authUser.isSuperAdmin()
    ) {
      throw new ForbiddenException(
        'You do not have permission to create non-private leagues'
      )
    }
    if (
      createLeagueDto.access === LeagueAccess.CompeteToEarn &&
      !authUser.isSuperAdmin()
    ) {
      throw new ForbiddenException(
        'You do not have permission to create compete to earn leagues'
      )
    }

    let options

    if (!authUser.isSuperAdmin()) {
      options = { userId: authUser.id }
    }

    return this.leaguesService.create(createLeagueDto, options)
  }

  // this endpoint is only for issuing test bfit in dev
  @Post('/leagues/users/reward-bfit')
  issueTestBfit(
    @Body() rewardBfitDto: RewardBfitDto,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      throw new ForbiddenException('Forbidden')
    }

    return this.leaguesService.incrementUserBfit(
      rewardBfitDto.email,
      rewardBfitDto.amount
    )
  }

  /**
   * 1. Owner of the league can update the league (but cannot set to public)
   * 2. Superadmin can update any league
   *
   * All other scenarios are handled by nested routes (e..g /team/ /organisation/ routes)
   * @param id
   * @param updateLeagueDto
   * @returns
   */
  @Put('/leagues/:id')
  @ApiTags('leagues')
  @ApiBody({ type: UpdateLeagueDto })
  @UpdateResponse()
  async update(
    @Param('id') id: string,
    @Body() updateLeagueDto: UpdateLeagueDto,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      // A non-superadmin tries to update a league to public
      if (updateLeagueDto.access !== LeagueAccess.Private) {
        throw new ForbiddenException(
          'You do not have permission to create non-private leagues'
        )
      }

      if (!(await this.leaguesService.isOwnedBy(id, authUser.id))) {
        throw new ForbiddenException(
          'You do not have permission to edit this league'
        )
      }
    }

    return this.leaguesService.update(id, updateLeagueDto)
  }

  /**
   * Admins create leagues for their team / organisation
   * @param createLeagueDto
   * @param teamId
   * @returns
   */

  @Iam(Roles.TeamAdmin, Roles.OrganisationAdmin)
  @Post(['/teams/:teamId/leagues', '/organisations/:organisationId/leagues'])
  @ApiTags('leagues')
  @ApiResponse({ type: League, status: 201 })
  teamCreate(
    @Body() createLeagueDto: CreateLeagueDto,
    @Param('teamId') teamId: string,
    @Param('organisationId') organisationId: string
  ) {
    return this.leaguesService.create(createLeagueDto, {
      teamId,
      organisationId
    })
  }

  /**
   * 1. Superadmin can retrieve all leagues
   * 2. Ordinary users retrieve all public leagues not participating in
   * 3. Users belonging to teams and organisations can retrieve these leagues
   * 4. Owners of private leagues can also see their leagues (even if not participating)
   * @returns
   */
  @Get('/leagues')
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @PaginationBody()
  findAll(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery,
    @Query()
    {
      isCte = true,
      isOrganization = true,
      isPrivate = true,
      isPublic = true,
      isTeam = true
    }: LeaguesFiltersDto
  ) {
    if (authUser.isSuperAdmin()) {
      return this.leaguesService.findAll({}, pagination)
    } else {
      return this.leaguesService.findAllNotParticipating(
        authUser.id,
        pagination,
        {
          isCte,
          isOrganization,
          isPrivate,
          isPublic,
          isTeam
        }
      )
    }
  }

  /**
   * All users can fetch compete to earn leagues
   */
  @Get('/leagues/access/compete-to-earn')
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @PaginationBody()
  findAllCompeteToEarnLeagues(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery,
    @Query()
    query: FilterCompeteToEarnDto
  ) {
    return this.leaguesService.findAllCompeteToEarnLeagues(
      pagination,
      authUser.id,
      query
    )
  }

  /**
   * 1. Anyone can create a private league
   * 2. Only superadmin can create a public league
   * All other scenarios are handled by nested routes (e..g /team/ /organisation/ routes)
   *
   * @param createLeagueDto
   * @returns
   */
  @Post('/leagues/:leagueId/claim')
  @ApiTags('leagues')
  @ApiResponse({ type: League, status: 201 })
  claimBFIT(
    @Body() claimLeagueBfitDto: ClaimLeagueBfitDto,
    @User() authUser: AuthenticatedUser,
    @Param('leagueId') leagueId: string
  ) {
    return this.leaguesService.claimLeagueBfit(
      leagueId,
      authUser.id,
      claimLeagueBfitDto
    )
  }

  @Get('/leagues/bfit/claims')
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @PaginationBody()
  findUserBfitClaims(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.leaguesService.getUserBfitClaims(authUser.id, pagination)
  }

  // user league bfit earnings history for the past 7 days
  @Get('/leagues/bfit/earnings')
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @PaginationBody()
  findUserBfitEarningsHistory(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.leaguesService.getUserBfitEarningsHistory(
      authUser.id,
      pagination
    )
  }

  @Iam(Roles.OrganisationAdmin, Roles.TeamAdmin)
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @Get(['/organisations/:organisationId/leagues', '/teams/:teamId/leagues'])
  findAllLeaguesForOrganisationsOrTeams(
    @Param('teamId') teamId: string,
    @Param('organisationId') organisationId: string,
    @Pagination() pagination: PaginationQuery
  ) {
    if (teamId) {
      return this.leaguesService.getAllLeaguesForTeam(teamId, pagination)
    }
    if (organisationId) {
      return this.leaguesService.getAllLeaguesForOrganisation(
        organisationId,
        pagination
      )
    }
  }

  /**
   * Searches for leagues by keyword
   *
   * @param query
   * @returns paginated leagues
   */
  @Get('leagues/search')
  @ApiTags('leagues')
  @PaginationBody()
  @ApiQuery({ type: SearchLeagueDto })
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  search(
    @Query() query: SearchLeagueDto,
    @User() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery,
    @Query()
    {
      isCte = true,
      isOrganization = true,
      isPrivate = true,
      isPublic = true,
      isTeam = true
    }: LeaguesFiltersDto
  ) {
    return this.leaguesService.searchManyAccessibleToUser(
      query.q,
      user.id,
      pagination,
      {
        isCte,
        isOrganization,
        isPrivate,
        isPublic,
        isTeam
      }
    )
  }

  /**
   * Gets all leagues the user is participating in
   * @param authUser
   * @returns
   */
  @Get('/me/leagues')
  @ApiTags('me')
  @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @PaginationBody()
  findMyLeagues(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.leaguesService.findAllParticipating(authUser.id, pagination)
  }

  /**
   * 1. Superadmin can get a single league
   * 2. Ordinary user can read a public league
   * 3. Owner user can read their own league
   * 4. TODO: Users belonging to teams and organisations may also have access to read
   *
   * @param id
   * @returns
   */
  @Get('/leagues/:leagueId')
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublic, status: 200 })
  async findOne(
    @Param('leagueId') leagueId: string,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      const result = await this.leaguesService.findOneAccessibleToUser(
        leagueId,
        authUser.id
      )
      if (!result) {
        const exists = await this.leaguesService.findOne(leagueId)
        if (exists) {
          throw new ForbiddenException(
            'You do not have permission to view this league'
          )
        } else {
          throw new NotFoundException('The league does not exist')
        }
      }
      return result
    } else {
      return this.leaguesService.findOne(leagueId)
    }
  }

  /*
   * 1. Superadmin can get a single league
   * 2. Ordinary user can read a public league
   * 3. Owner user can read their own league
   * 4. TODO: Users belonging to teams and organisations may also have access to read
   * 5.
   * @param id
   * @returns
   */
  @Get('/leagues/:leagueId/dailybfit')
  @ApiTags('leagues')
  @ApiResponse({ type: LeaguePublic, status: 200 })
  async findLeagueDailyBfit(
    @Param('leagueId') leagueId: string,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      const result = await this.leaguesService.findOneAccessibleToUser(
        leagueId,
        authUser.id
      )
      if (!result) {
        const exists = await this.leaguesService.findOne(leagueId)
        if (exists) {
          throw new ForbiddenException(
            'You do not have permission to view this league'
          )
        } else {
          throw new NotFoundException('The league does not exist')
        }
      }
      return this.leaguesService.findLeagueDailyBfit(leagueId)
    } else {
      return this.leaguesService.findLeagueDailyBfit(leagueId)
    }
  }

  /**
   * Get a list of users that be invited to the league
   *
   * @param id
   * @returns
   */
  @Get('/leagues/:leagueId/inviteable')
  @ApiTags('leagues')
  // @ApiQuery({ type: SearchUserForLeaguesDto })
  @ApiResponse({ type: UserPublicPagination, status: 200 })
  async searchInviteableUsers(
    @Param('leagueId') leagueId: string,
    @Pagination() pagination: PaginationQuery,
    @User() authUser: AuthenticatedUser,
    @Query() query: SearchUserForLeaguesDto
  ) {
    if (!authUser.isSuperAdmin()) {
      const result = await this.leaguesService.findOneAccessibleToUser(
        leagueId,
        authUser.id
      )
      if (!result) {
        throw new ForbiddenException(
          'You do not have permission to view this league'
        )
      }
    }

    return this.leaguesService.searchUsersWithJoinAccess(
      leagueId,
      authUser.id,
      pagination,
      query.q
    )
  }

  /**
   * 1. Gets a ranked list of members (paginated)
   *
   * @param id
   * @returns
   */
  @Get('/leagues/:leagueId/members')
  @ApiTags('leagues')
  @ApiResponse({ type: League, status: 200 })
  async getLeagueMembers(
    @Param('leagueId') leagueId: string,
    @Pagination() pagination: PaginationQuery,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      let league = await this.leaguesService.getLeagueIfInvited(
        leagueId,
        authUser.id
      )

      if (!league) {
        league = await this.leaguesService.findOneAccessibleToUser(
          leagueId,
          authUser.id
        )
      }

      if (!league) {
        throw new ForbiddenException(
          'You do not have permission to view this league'
        )
      }
    }

    return this.leaguesService.getLeaderboardMembers(leagueId, pagination)
  }

  /**
   * 1. Gets a current user leaderboard entry
   *
   * @param id
   * @returns
   */
  @Get('/leagues/:leagueId/members/me')
  @ApiTags('leagues')
  @ApiResponse({ type: League, status: 200 })
  async getLeagueMembersMe(
    @Param('leagueId') leagueId: string,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      let league = await this.leaguesService.getLeagueIfInvited(
        leagueId,
        authUser.id
      )

      if (!league) {
        league = await this.leaguesService.findOneAccessibleToUser(
          leagueId,
          authUser.id
        )
      }

      if (!league) {
        throw new ForbiddenException(
          'You do not have permission to view this league'
        )
      }
    }

    const leaderboardEntry =
      await this.leaguesService.getLeaderboardMemberByUserId(
        leagueId,
        authUser.id
      )

    if (!leaderboardEntry) {
      throw new NotFoundException("User isn't member yet")
    }
    return leaderboardEntry
  }

  /**
   * Gets the rank of the user and 2 users flanking it.
   *
   * @param leagueId
   * @returns
   */
  @Get('/leagues/:leagueId/rank')
  @ApiTags('leagues')
  @ApiResponse({ type: League, status: 200 })
  getLeagueRankAndFlanks(
    @Param('leagueId') leagueId: string,
    @User() authUser: AuthenticatedUser
  ) {
    return this.leaguesService.getLeaderboardRankAndFlanks(
      leagueId,
      authUser.id
    )
  }

  /**
   * A user can join a private league
   *
   * @param id
   * @param joinLeagueDto
   * @param authUser
   */
  @Post('/leagues/join')
  @ApiResponse({ type: JoinPrivateLeagueResultDto, status: 200 })
  @HttpCode(200)
  async joinPrivateLeague(
    @Body() { token }: JoinPrivateLeagueDto,
    @User() authUser: AuthenticatedUser
  ) {
    const invitation = await this.leaguesInvitationsService.verifyToken(token)
    return this.leaguesService.joinLeague(invitation.league.id, authUser.id)
  }

  /**
   * A user can join a public or compete to earn league
   *
   * @param id
   * @param joinLeagueDto
   * @param authUser
   */
  @Post('/leagues/:leagueId/join')
  @SuccessResponse()
  async joinLeague(
    @Param('leagueId') leagueId: string,
    @User() authUser: AuthenticatedUser
  ) {
    // Most users trying to join a league will be invited
    let league = await this.leaguesService.getLeagueIfInvited(
      leagueId,
      authUser.id
    )

    if (!league) {
      league = await this.leaguesService.findOneAccessibleToUser(
        leagueId,
        authUser.id
      )
    }

    if (!league) {
      throw new ForbiddenException(
        'You do not have permission to join this league'
      )
    }

    const result = await this.leaguesService.joinLeague(leagueId, authUser.id)

    return result
  }

  /**
   * A user can join a public league or a private league
   * (given a valid invitation token)
   *
   * @param id
   * @param joinLeagueDto
   * @param authUser
   */
  @Post('/leagues/:leagueId/leave')
  @SuccessResponse()
  @HttpCode(200)
  async leaveLeague(
    @Param('leagueId') id: string,
    @User() authUser: AuthenticatedUser
  ) {
    return this.leaguesService.leaveLeague(id, authUser.id)
  }

  /**
   * Team admin can get a single league within the team
   * @param teamId
   * @param id
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Get('/teams/:teamId/leagues/:id')
  @ApiResponse({ type: LeaguePublic, status: 200 })
  teamFindOne(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.leaguesService.getTeamLeagueWithId(id, teamId)
  }

  /**
   * Team admin can update a league within the team
   * @param teamId
   * @param id
   * @param updateLeagueDto
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Put('/teams/:teamId/leagues/:id')
  @ApiResponse({ type: League, status: 200 })
  teamUpdate(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() updateLeagueDto: UpdateLeagueDto
  ) {
    return this.leaguesService.update(id, updateLeagueDto, { teamId })
  }

  /**
   * 1. Superadmin can delete a league.
   * 2. League owner can delete the private league
   * @param id
   * @returns
   */
  @Delete('/leagues/:leagueId')
  @DeleteResponse()
  async remove(
    @Param('leagueId') leagueId: string,
    @User() authUser: AuthenticatedUser
  ) {
    if (!authUser.isSuperAdmin()) {
      if (!(await this.leaguesService.isOwnedBy(leagueId, authUser.id))) {
        throw new ForbiddenException(
          'You do not have permission to delete this league'
        )
      }
    }

    return this.leaguesService.remove(leagueId)
  }

  /**
   * Team admin can delete a league within the team
   * @param teamId
   * @param id
   * @returns
   */
  @Iam(Roles.TeamAdmin)
  @Delete('/teams/:teamId/leagues/:id')
  @DeleteResponse()
  teamDelete(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.leaguesService.remove(id, teamId)
  }

  @Iam(Roles.SuperAdmin)
  @Get('/winner/:leagueId')
  async calcWinner(@Param('leagueId') leagueId: string) {
    const { winners } = await this.leaguesService.calculateLeagueWinners(
      leagueId
    )
    await this.leaguesService.emitWinnerFeedItems(leagueId, winners)
    return { winners }
  }

  /**
   * Webhook for AWS Lambda to update leagues
   */
  @Public()
  @Post('/leagues/job')
  async processLeagues(@Body() { verify_token }: LeagueJobDto) {
    if (verify_token !== this.configService.get('JOBS_VERIFY_TOKEN')) {
      throw new ForbiddenException()
    }
    const [pending, ending] = await Promise.all([
      this.leaguesService.processPendingLeagues(),
      this.leaguesService.processLeaguesEnding()
    ])

    return {
      pending,
      ending
    }
  }

  @Public()
  @Get('/teams/:teamId/public/leagues')
  async getTeamLeaguesForPublicPage(@Param('teamId') teamId: string) {
    const leagues = await this.leaguesService.getTeamLeaguesForPublicPage(
      teamId
    )
    return leagues
  }
}
