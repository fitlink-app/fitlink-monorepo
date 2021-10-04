import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  BadRequestException
} from '@nestjs/common'
import {
  TeamsInvitationsService,
  TeamsInvitationsServiceError
} from './teams-invitations.service'
import { CreateTeamsInvitationDto } from './dto/create-teams-invitation.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { VerifyTeamsInvitationDto } from './dto/verify-teams-invitation.dto'
import { Team } from '../teams/entities/team.entity'
import { Public } from '../../decorators/public.decorator'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { RespondTeamsInvitationDto } from './dto/respond-teams-invitation.dto'

@Controller()
@ApiTags('teams')
export class TeamsInvitationsController {
  constructor(
    private readonly teamsInvitationsService: TeamsInvitationsService
  ) {}

  /**
   * Generates a JWT that lasts 7 days for the invitee
   * to redeem the invitation and join the organisation.
   *
   * This allows a user to signup with the invitation
   * and automatically associate it to a new account,
   * or alternatively, the UI could consume the JWT
   * while the user is logged in, and associate it to their
   * current account.
   *
   * @param CreateTeamsInvitationDto
   * @returns TeamInvitation
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Post([
    'organisations/:organisationId/teams/:teamId/invitations',
    'teams/:teamId/invitations'
  ])
  create(
    @Param('teamId') id,
    @Body() createTeamsInvitationDto: CreateTeamsInvitationDto,
    @User() user: AuthenticatedUser
  ) {
    const team = new Team()
    team.id = id

    return this.teamsInvitationsService.create(
      {
        ...createTeamsInvitationDto,
        ...{ team }
      },
      user.id
    )
  }

  /**
   * Retrieves a list of all current team invitations
   * Filterable by dismissed=1&accepted=1
   *
   * Defaults to show items that have yet to be accepted or dismissed.
   *
   * @param request
   * @returns object
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Get('organisations/:organisationId/teams/:teamId/invitations')
  findAll(@Request() request) {
    const { dismissed, accepted } = request.query
    return this.teamsInvitationsService.findAll(
      {
        dismissed: dismissed === '1',
        accepted: accepted === '1'
      },
      {
        limit: request.query.limit || 10,
        page: request.query.page || 0
      }
    )
  }

  /**
   * Retrieves a single invitation to view detailed
   * information about it
   *
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Get('organisations/:organisationId/teams/:teamId/invitations/:id')
  findOne(@Param('id') id: string) {
    return this.teamsInvitationsService.findOne(id)
  }

  /**
   * Deletes an invitation which has the effect
   * of rescinding the invitation. The JWT will
   * still be valid but when checked against the database
   * it will not be found, and the user can't proceed to
   * accept it.
   *
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Delete('organisations/:organisationId/teams/:teamId/invitations/:id')
  remove(@Param('id') id: string) {
    return this.teamsInvitationsService.remove(id)
  }

  /**
   * Generates a new JWT against the invitation
   * and resends the invitation email.
   *
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.TeamAdmin)
  @Put('organisations/:organisationId/teams/:teamId/invitations/:id')
  resend(@Param('id') id: string) {
    return this.teamsInvitationsService.resend(id)
  }

  /**
   * Verifies that a token is still valid. This is useful
   * in the UI layer to tell the user whether they can
   * still proceed with creating an account, or alternatively
   * with merging the organisation under their current login.
   *
   * Throws an UnauthorizedException if the token is no
   * longer valid.
   *
   * @param token
   * @returns boolean
   */
  @Public()
  @Post('teams-invitations/verify')
  async verify(@Body() { token }: VerifyTeamsInvitationDto) {
    const result = await this.teamsInvitationsService.verifyToken(token)

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    if (!result) {
      throw new BadRequestException(TeamsInvitationsServiceError.TokenNotFound)
    }

    return result
  }
}
