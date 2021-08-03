import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request
} from '@nestjs/common'
import { OrganisationsInvitationsService } from './organisations-invitations.service'
import { CreateOrganisationsInvitationDto } from './dto/create-organisations-invitation.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { VerifyOrganisationsInvitationDto } from './dto/verify-organisations-invitation.dto'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Public } from '../../decorators/public.decorator'
import { ApiTags } from '@nestjs/swagger'

@Controller()
@ApiTags('organisations')
export class OrganisationsInvitationsController {
  constructor(
    private readonly organisationsInvitationsService: OrganisationsInvitationsService
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
   * @param createOrganisationsInvitationDto
   * @returns OrganisationInvitation
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Post('organisations/:organisationId/invitations')
  create(
    @Param('organisationId') organisationId,
    @Body() createOrganisationsInvitationDto: CreateOrganisationsInvitationDto
  ) {
    return this.organisationsInvitationsService.create(organisationId, {
      ...createOrganisationsInvitationDto
    })
  }

  /**
   * Retrieves a list of all current organisation invitations
   * Filterable by dismissed=1&accepted=1
   *
   * Defaults to show items that have yet to be accepted or dismissed.
   *
   * @param request
   * @returns object
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Get('organisations/:organisationId/invitations')
  findAll(@Request() request) {
    const { dismissed, accepted } = request.query
    return this.organisationsInvitationsService.findAll(
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
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Get('organisations/:organisationId/invitations/:id')
  findOne(@Param('id') id: string) {
    return this.organisationsInvitationsService.findOne(id)
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
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Delete('organisations/:organisationId/invitations/:id')
  remove(@Param('id') id: string) {
    return this.organisationsInvitationsService.remove(id)
  }

  /**
   * Generates a new JWT against the invitation
   * and resends the invitation email.
   *
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Put('organisations/:organisationId/invitations/:id')
  resend(@Param('id') id: string) {
    return this.organisationsInvitationsService.resend(id)
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
  @Post('organisations-invitations/verify')
  verify(@Body() { token }: VerifyOrganisationsInvitationDto) {
    return this.organisationsInvitationsService.verifyToken(token)
  }
}
