import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Request,
  BadRequestException,
  Query
} from '@nestjs/common'
import {
  SubscriptionsService,
  SubscriptionServiceError
} from './subscriptions.service'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { CreateDefaultSubscriptionDto } from './dto/create-default-subscription.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ApiBaseResponses,
  PaginationBody,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import {
  Subscription,
  SubscriptionPagination
} from './entities/subscription.entity'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { User } from '../users/entities/user.entity'
import { AddUserToSubscriptionDto } from './dto/add-user-to-subscription.dto'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { AuthenticatedUser } from '../../models'
import { RespondSubscriptionsInvitationDto } from './dto/respond-subscriptions-invitation.dto'

@Controller()
@ApiTags('subscriptions')
@ApiBaseResponses()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post(['/subscriptions', '/organisations/:organisationId/subscriptions'])
  createOne(
    @Body() { organisationId, ...dto }: CreateSubscriptionDto,
    @Param('organisationId') paramOrganisationId: string
  ) {
    if (paramOrganisationId) {
      organisationId = paramOrganisationId
    }
    return this.subscriptionsService.createDefault(dto, organisationId)
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin)
  @Get('/subscriptions')
  @PaginationBody()
  @ApiResponse({ type: SubscriptionPagination, status: 200 })
  findAll(
    @Pagination() pagination: PaginationQuery,
    @AuthUser() user: AuthenticatedUser
  ) {
    if (user.isSuperAdmin()) {
      return this.subscriptionsService.findAll(pagination)
    } else {
      return this.subscriptionsService.findAllAccessibleBy(user.id, pagination)
    }
  }

  @Iam(Roles.OrganisationAdmin)
  @Get('/organisations/:organisationId/subscriptions')
  @PaginationBody()
  @ApiResponse({ type: SubscriptionPagination, status: 200 })
  findAllWithinOrganisation(
    @Pagination() pagination: PaginationQuery,
    @Param('organisationId') organisationId: string
  ) {
    return this.subscriptionsService.findAll(pagination, {
      organisationId
    })
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Get([
    '/subscriptions/:subscriptionId',
    '/organisations/:organisationId/subscriptions/:subscriptionId'
  ])
  @PaginationBody()
  @ApiResponse({ type: Subscription, status: 200 })
  findOneSubscription(@Param('subscriptionId') subId: string) {
    return this.subscriptionsService.findOneSubscription(subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Get([
    '/subscriptions/:subscriptionId/users',
    '/organisations/:organisationId/subscriptions/:subscriptionId/users'
  ])
  @PaginationBody()
  @ApiResponse({ type: User, status: 200 })
  findOneSubscriptionUsers(
    @Param('subscriptionId') subId: string,
    @Param('organisationId') organisationId: string,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.subscriptionsService.findSubscriptionUsers(subId, pagination, {
      organisationId
    })
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Delete([
    '/subscriptions/:subscriptionId',
    '/organisations/:organisationId/subscriptions/:subscriptionId'
  ])
  @PaginationBody()
  @ApiResponse({ type: Subscription, status: 200 })
  async deleteOneSubscription(
    @Param('subscriptionId') subId: string,
    @Param('organisationId') organisationId: string
  ) {
    const result = await this.subscriptionsService.deleteSubscription(
      subId,
      organisationId
    )
    if (result === SubscriptionServiceError.CannotDeleteDefault) {
      throw new BadRequestException(
        'You cannot delete the default subscription'
      )
    }

    return result
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Get([
    '/subscriptions/:subscriptionId/chargebee/hosted-page',
    '/organisations/:organisationId/subscriptions/:subscriptionId/chargebee/hosted-page'
  ])
  @ApiResponse({ type: Subscription, status: 200 })
  async chargebeeHostedPage(@Param('subscriptionId') subId: string) {
    const result = await this.subscriptionsService.getChargebeeHostedPage(subId)
    if (result === SubscriptionServiceError.CustomerNotFound) {
      throw new BadRequestException(
        'The customer does not have a payment plan yet'
      )
    }

    return result
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Get([
    '/subscriptions/:subscriptionId/chargebee/subscription',
    '/organisations/:organisationId/subscriptions/:subscriptionId/chargebee/subscription'
  ])
  @ApiResponse({ type: Subscription, status: 200 })
  async chargebeeSubscription(@Param('subscriptionId') subId: string) {
    const subscription = await this.subscriptionsService.findOneSubscription(
      subId
    )
    const result = await this.subscriptionsService.getChargebeeSubscription(
      subscription
    )
    return result
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Get([
    '/subscriptions/:subscriptionId/chargebee/invoice-download-link/:invoiceId',
    '/organisations/:organisationId/subscriptions/:subscriptionId/chargebee/invoice-download-link/:invoiceId'
  ])
  @PaginationBody()
  @ApiResponse({ type: Subscription, status: 200 })
  async chargebeeInvoiceDownloadLink(@Param('invoiceId') invoiceId: string) {
    const result = await this.subscriptionsService.chargebeeGeneratedInvoiceLink(
      invoiceId
    )
    return result
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Get([
    '/subscriptions/:subscriptionId/chargebee/payment-sources',
    '/organisations/:organisationId/subscriptions/:subscriptionId/chargebee/payment-sources'
  ])
  @PaginationBody()
  @ApiResponse({ type: Subscription, status: 200 })
  async chargebeePaymentSources(@Param('subscriptionId') subId: string) {
    const result = await this.subscriptionsService.getChargebeePaymentSources(
      subId
    )
    if (result === SubscriptionServiceError.CustomerNotFound) {
      throw new BadRequestException(
        'The customer does not have a payment plan yet'
      )
    }

    return result
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Get([
    '/subscriptions/:subscriptionId/chargebee/invoices',
    '/organisations/:organisationId/subscriptions/:subscriptionId/chargebee/invoices'
  ])
  @PaginationBody()
  @ApiResponse({ type: Subscription, status: 200 })
  async chargebeeInvoices(
    @Param('subscriptionId') subId: string,
    @Query('offset') offset?: string
  ) {
    const subscription = await this.findOneSubscription(subId)
    const result = await this.subscriptionsService.getChargebeeInvoices(
      subscription,
      offset
    )

    return result
  }

  @Iam(Roles.SuperAdmin, Roles.SubscriptionAdmin, Roles.OrganisationAdmin)
  @Put([
    '/subscriptions/:subscriptionId',
    '/organisations/:organisationId/subscriptions/:subscriptionId'
  ])
  @UpdateResponse()
  updateOne(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Param('subscriptionId') subId: string,
    @Param('organisationId') organisationId: string
  ) {
    if (organisationId) {
      updateSubscriptionDto.organisationId = organisationId
    }
    return this.subscriptionsService.updateOne(updateSubscriptionDto, subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post([
    '/subscriptions/:subscriptionId/users',
    '/organisations/:organisationId/subscriptions/:subscriptionId/users'
  ])
  addUserToSubscription(
    @Body() addUserDto: AddUserToSubscriptionDto,
    @Param('subscriptionId') subscriptionId: string,
    @Param('organisationId') organisationId: string
  ) {
    return this.subscriptionsService.addUser(addUserDto.id, subscriptionId, {
      organisationId
    })
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Delete([
    '/subscriptions/:subscriptionId/users/:userId',
    '/organisations/:organisationId/subscriptions/:subscriptionId/users/:userId'
  ])
  async removeFromSubscription(
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string,
    @Param('userId') userId: string
  ) {
    const result = await this.subscriptionsService.removeUserFromSubscription(
      userId,
      subId,
      {
        organisationId
      }
    )

    if (result === SubscriptionServiceError.CannotDeleteDefault) {
      throw new BadRequestException(
        'This user still belongs to one or more teams and cannot be removed yet. Delete them from teams first.'
      )
    }

    if (result === SubscriptionServiceError.NoDefaultAvailable) {
      throw new BadRequestException(
        'This user still belongs to one or more teams and cannot be removed yet. You must set a default subscription.'
      )
    }

    return result
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/usersIds')
  assignUsersByUsersIds(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.assignUsers(
      updateSubscriptionDto,
      organisationId,
      subId
    )
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post(
    '/organisations/:organisationId/subscriptions/:subscriptionId/:teamId/users'
  )
  assignUsersByTeamId(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string,
    @Param('teamId') teamId: string
  ) {
    return this.subscriptionsService.assignUsers(
      updateSubscriptionDto,
      organisationId,
      subId,
      teamId
    )
  }

  @Iam(Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/billing')
  setupBilling(
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.setupBilling(organisationId, subId)
  }

  @Iam(Roles.SubscriptionAdmin)
  @Post(
    '/organisations/:organisationId/subscriptions/:subscriptionId/billing/chargebee'
  )
  createChargebeePlan(
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.setupBilling(organisationId, subId, true)
  }

  @Iam(Roles.SubscriptionAdmin)
  @Get(
    '/organisations/:organisationId/subscriptions/:subscriptionId/billing/:customerId'
  )
  getChargebeePlan(
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string,
    @Param('customerId') customerId: string
  ) {
    return this.subscriptionsService.getChargebeePlan(
      organisationId,
      subId,
      customerId
    )
  }

  @Iam(Roles.SubscriptionAdmin)
  @Delete(
    '/organisations/:organisationId/subscriptions/:subscriptionId/billing/:customerId'
  )
  removeChargebeePlan(
    @Param('organisationId') organisationId: string,
    @Param('subscriptionId') subId: string,
    @Param('customerId') customerId: string
  ) {
    return this.subscriptionsService.removeChargebeePlan(
      organisationId,
      subId,
      customerId
    )
  }

  @Post('/subscriptions-invitations/respond')
  async accept(
    @Body() { token, accept }: RespondSubscriptionsInvitationDto,
    @AuthUser() user: AuthenticatedUser
  ) {
    const result = await this.subscriptionsService.respondToInvitation(
      token,
      accept,
      user.id
    )
    if (typeof result === 'string') {
      throw new BadRequestException(result)
    }
    return result
  }
}
