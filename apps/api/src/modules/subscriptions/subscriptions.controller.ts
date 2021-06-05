import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { CreateDefaultSubscriptionDto } from './dto/create-default-subscription.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/entities/user-role.entity'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin)
  @Post('/organisations/:organisationId/subscriptions')
  create(
    @Body() createDefaultSubscriptionDto: CreateDefaultSubscriptionDto,
    @Param('organisationId') organisationId: string
    ) {
    return this.subscriptionsService.createDefault(createDefaultSubscriptionDto, organisationId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Get('/organisations/:organisationId/subscriptions/:subscriptionId')
  findOne(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string
    ) {
    return this.subscriptionsService.findOne(orgId, subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Put('/organisations/:organisationId/subscriptions/:subscriptionId')
  update(
    @Body() updateOrganisationDto: UpdateSubscriptionDto,
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
  ) {
    return this.subscriptionsService.update(updateOrganisationDto, orgId, subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Delete('/organisations/:organisationId/subscriptions/:subscriptionId')
  remove(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.remove(orgId, subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/users')
  assignUsersBySubId(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.assignUsers(updateSubscriptionDto, orgId, subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/usersIds')
  assignUsersByUsersIds(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
  ) {
    return this.subscriptionsService.assignUsers(updateSubscriptionDto, orgId, subId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/:teamId/users')
  assignUsersByTeamId(
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.subscriptionsService.assignUsers(updateSubscriptionDto, orgId, subId, teamId)
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Get('/organisations/:organisationId/subscriptions/:subscriptionId/users')
  findAllUsers(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
    @Request() request
  ) {
    return this.subscriptionsService.findAllUsers(orgId, subId, {
      limit: Object.prototype.hasOwnProperty.call(request.query, 'limit')
        ? request.query.limit
        : 10,
      page: Object.prototype.hasOwnProperty.call(request.query, 'page')
        ? request.query.page
        : 0
    })
  }

  @Iam(Roles.SuperAdmin, Roles.OrganisationAdmin, Roles.SubscriptionAdmin)
  @Delete('/organisations/:organisationId/subscriptions/:subscriptionId/users/:userId')
  removeUser(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
    @Param('userId') userId: string,
  ) {
    return this.subscriptionsService.removeUser(orgId, subId, userId)
  }

  @Iam(Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/billing')
  setupBilling(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.setupBilling(orgId, subId)
  }

  @Iam(Roles.SubscriptionAdmin)
  @Post('/organisations/:organisationId/subscriptions/:subscriptionId/billing/chargebee')
  createChargebeePlan(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string
  ) {
    return this.subscriptionsService.setupBilling(orgId, subId, true)
  }

  @Iam(Roles.SubscriptionAdmin)
  @Get('/organisations/:organisationId/subscriptions/:subscriptionId/billing/:customerId')
  getChargebeePlan(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
    @Param('customerId') customerId: string
  ) {
    return this.subscriptionsService.getChargebeePlan(orgId, subId, customerId)
  }

  @Iam(Roles.SubscriptionAdmin)
  @Delete('/organisations/:organisationId/subscriptions/:subscriptionId/billing/:customerId')
  removeChargebeePlan(
    @Param('organisationId') orgId: string,
    @Param('subscriptionId') subId: string,
    @Param('customerId') customerId: string
  ) {
    return this.subscriptionsService.removeChargebeePlan(orgId, subId, customerId)
  }

}
