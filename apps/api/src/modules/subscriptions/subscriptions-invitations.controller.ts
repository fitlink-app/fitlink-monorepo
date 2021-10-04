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
  SubscriptionsInvitationsService,
  SubscriptionsInvitationsServiceError
} from './subscriptions-invitations.service'
import { CreateSubscriptionsInvitationDto } from './dto/create-subscriptions-invitation.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { VerifySubscriptionsInvitationDto } from './dto/verify-subscriptions-invitation.dto'
import { Subscription } from '../subscriptions/entities/subscription.entity'
import { Public } from '../../decorators/public.decorator'
import { ApiTags } from '@nestjs/swagger'
import { User } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'

@Controller()
@ApiTags('subscriptions')
export class SubscriptionsInvitationsController {
  constructor(
    private readonly subscriptionsInvitationsService: SubscriptionsInvitationsService
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
   * @param CreateSubscriptionsInvitationDto
   * @returns TeamInvitation
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Post([
    'organisations/:organisationId/subscriptions/:subscriptionId/invitations',
    'subscriptions/:subscriptionId/invitations'
  ])
  create(
    @Param('subscriptionId') id,
    @Body() dto: CreateSubscriptionsInvitationDto,
    @User() user: AuthenticatedUser
  ) {
    const subscription = new Subscription()
    subscription.id = id

    return this.subscriptionsInvitationsService.create(
      {
        ...dto,
        ...{ subscription }
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
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Get(
    'organisations/:organisationId/subscriptions/:subscriptionId/invitations'
  )
  findAll(@Request() request) {
    const { dismissed, accepted } = request.query
    return this.subscriptionsInvitationsService.findAll(
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
  @Get(
    'organisations/:organisationId/subscriptions/:subscriptionId/invitations/:id'
  )
  findOne(@Param('id') id: string) {
    return this.subscriptionsInvitationsService.findOne(id)
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
  @Delete(
    'organisations/:organisationId/subscriptions/:subscriptionId/invitations/:id'
  )
  remove(@Param('id') id: string) {
    return this.subscriptionsInvitationsService.remove(id)
  }

  /**
   * Generates a new JWT against the invitation
   * and resends the invitation email.
   *
   * @param id
   * @returns
   */
  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Put(
    'organisations/:organisationId/subscriptions/:subscriptionId/invitations/:id'
  )
  resend(@Param('id') id: string) {
    return this.subscriptionsInvitationsService.resend(id)
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
  @Post('subscriptions-invitations/verify')
  async verify(@Body() { token }: VerifySubscriptionsInvitationDto) {
    const result = await this.subscriptionsInvitationsService.verifyToken(token)

    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }

    if (!result) {
      throw new BadRequestException(
        SubscriptionsInvitationsServiceError.TokenNotFound
      )
    }

    return result
  }
}
