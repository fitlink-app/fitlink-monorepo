import {
  Injectable,
  BadRequestException,
  HttpService,
  HttpException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { CreateDefaultSubscriptionDto } from './dto/create-default-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { Subscription } from './entities/subscription.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import {
  Customer,
  CustomerBillingAddress,
  HostedPage,
  Invoice,
  PaymentSource,
  Subscription as ChargebeeSubscription
} from 'chargebee-typescript/lib/resources'
import { BillingPlanStatus, SubscriptionType } from './subscriptions.constants'
import { SuccessResultDto } from '../../classes/dto/success'
import { SubscriptionsInvitationsService } from './subscriptions-invitations.service'
import { UserRolesService } from '../user-roles/user-roles.service'
import { differenceInDays } from 'date-fns'
import { UserRole } from '../user-roles/entities/user-role.entity'
import { ConfigService } from '@nestjs/config'

type EntityOwner = {
  organisationId?: string
  subscriptionId?: string
  teamId?: string
}

interface ChargebeeError {
  api_error_code: string
  message: string
  type?: string
  param?: string
}

export enum SubscriptionServiceError {
  CustomerNotFound = 'customer_not_found',
  CannotDeleteDefault = 'cannot_delete_default',
  NoDefaultAvailable = 'no_default_subscription_available'
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,

    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,

    @InjectRepository(Team)
    private teamRepository: Repository<Team>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private invitationsService: SubscriptionsInvitationsService,
    private userRolesService: UserRolesService,
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  /**
   * Creates a subscription for the organisation
   * @param createDefaultDto
   * @param organisationId
   */
  async createDefault(
    createDefaultDto: CreateDefaultSubscriptionDto,
    organisationId: string,
    override?: Partial<Subscription>
  ): Promise<Subscription> {
    const { billing_entity, ...rest } = createDefaultDto
    const org = await this.organisationRepository.findOne(organisationId, {
      relations: ['subscriptions']
    })

    let subscription = new Subscription()
    subscription.organisation = org
    subscription.billing_entity = billing_entity

    // If no subscriptions exist, make this one the default
    if (org.subscriptions.length === 0) {
      subscription.default = true
    }

    if (rest) {
      subscription = Object.assign(subscription, { ...rest })
    }

    const result = await this.subscriptionRepository.findOne(subscription)
    return await this.subscriptionRepository.save({
      ...result,
      ...subscription,
      ...override
    })
  }

  /**
   * Find the subscription
   * @param orgId
   * @param subId
   */
  async findOneSubscription(
    subId: string,
    relations: Array<string> = ['organisation']
  ) {
    return await this.subscriptionRepository.findOne(subId, {
      relations: relations
    })
  }

  /**
   * Find the subscription
   * @param orgId
   * @param subId
   */
  async findOne(
    orgId: string,
    subId: string,
    relations: Array<string> = ['organisation']
  ) {
    const organisation = new Organisation()
    organisation.id = orgId

    const subscription = new Subscription()
    subscription.id = subId
    subscription.organisation = organisation
    return await this.subscriptionRepository.findOne(subscription, {
      relations: relations
    })
  }

  async findSubscriptionUsers(
    subId: string,
    options: PaginationOptionsInterface,
    entityOwner: EntityOwner
  ): Promise<Pagination<User>> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.subscription', 'subscription')
      .innerJoinAndSelect('subscription.organisation', 'organisation')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .where('subscription.id = :subId', { subId })

    if (entityOwner.organisationId) {
      query = query.andWhere('organisation.id = :organisationId', {
        organisationId: entityOwner.organisationId
      })
    }

    query = query.take(options.limit).skip(options.page * options.limit)

    const [results, total] = await query.getManyAndCount()

    return new Pagination<User>({
      results,
      total
    })
  }

  /**
   * Update the subscription
   * Used for superadmin access
   *
   * @param subId
   */
  async updateOne(
    { organisationId, ...dto }: UpdateSubscriptionDto,
    subId: string
  ) {
    const update: Partial<Subscription> = dto

    const subscription = await this.subscriptionRepository.findOne(subId, {
      relations: ['organisation']
    })

    if (
      !subscription ||
      (organisationId && subscription.organisation.id !== organisationId)
    ) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    if (organisationId) {
      update.organisation = new Organisation()
      update.organisation.id = organisationId
    }

    const setToDefault = dto.default === true

    if (setToDefault && subscription.organisation) {
      // Remove default setting on all other subscriptions
      await this.subscriptionRepository
        .createQueryBuilder()
        .update(Subscription)
        .set({
          default: false
        })
        .where('id != :subId AND organisation.id = :orgId', {
          subId,
          orgId: subscription.organisation.id
        })
        .execute()
    }

    // The subscription is not yet connected to a ChargeBee billing plan
    try {
      if (
        !subscription.billing_plan_customer_id &&
        subscription.type !== SubscriptionType.Free
      ) {
        const customer = await this.updateChargeBeeCustomer({
          ...subscription,
          ...update
        })
        update.billing_plan_customer_id = customer.id
      } else {
        // Update the ChargeBee customer
        await this.updateChargeBeeCustomer({ ...subscription, ...update })
      }
    } catch (e) {
      const msg = e.message ? e.message.split(':')[1] || e.message : e
      console.log(e)
      throw new BadRequestException(
        `There was a problem updating your billing information: ${msg}`
      )
    }

    return await this.subscriptionRepository.update(subId, update)
  }

  /**
   * Update the subscription
   * @param orgId
   * @param subId
   */
  async update(
    updateSubscriptionDto: UpdateSubscriptionDto,
    orgId: string,
    subId: string
  ) {
    const subscription = await this.findOne(orgId, subId)

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }
    return await this.subscriptionRepository.update(
      subId,
      updateSubscriptionDto
    )
  }

  /**
   * Deletes the subscription
   * @param orgId
   * @param subId
   */
  async deleteSubscription(subId: string, organisationId?: string) {
    const subscription = await this.findOneSubscription(subId, [
      'users',
      'organisation'
    ])
    if (organisationId && subscription.organisation.id !== organisationId) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    if (subscription.default) {
      return SubscriptionServiceError.CannotDeleteDefault
    }

    const defaultSubscription = await this.subscriptionRepository.findOne({
      where: {
        organisation: {
          id: subscription.organisation.id
        },
        default: true
      }
    })

    // Reassign the users to the default subscription
    if (!defaultSubscription) {
      throw new BadRequestException(
        'No default subscription available. Please set a subscription as default and try again'
      )
    }

    return this.subscriptionRepository.manager.transaction(async (manager) => {
      await manager.getRepository(User).update(
        {
          subscription: { id: subscription.id }
        },
        {
          subscription: defaultSubscription
        }
      )
      await manager
        .getRepository(UserRole)
        .delete({ subscription: { id: subscription.id } })
      return manager.getRepository(Subscription).delete(subscription.id)
    })
  }

  /**
   * Deletes the subscription
   * @param orgId
   * @param subId
   */
  async remove(orgId: string, subId: string) {
    const subscription = await this.findOne(orgId, subId, ['organisation'])

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    try {
      await subscription.users
    } catch {
      await this.subscriptionRepository.delete(subscription)
      return 'subscription is deleted'
    }

    await this.subscriptionRepository
      .createQueryBuilder()
      .relation('users')
      .of(subscription)
      .remove(subscription.users)

    //console.log('subscription after: ', await this.findOne(orgId, subId, ['users']))
    return 'subscription is deleted'
  }

  /**
   * Transaction to add the specific user to the subscription
   * @param userId
   * @param subscriptionId
   * @returns
   */
  async addUser(
    userId: string,
    subscriptionId: string,
    entityOwner: EntityOwner
  ): Promise<SuccessResultDto> {
    // Ensure if an organisation is requested, the subscription belongs to it.
    if (entityOwner.organisationId) {
      await this.subscriptionRepository.findOneOrFail({
        where: {
          id: subscriptionId,
          organisation: {
            id: entityOwner.organisationId
          }
        }
      })
    }

    await this.subscriptionRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Subscription)
      await repo
        .createQueryBuilder()
        .relation(Subscription, 'users')
        .of(subscriptionId)
        .add(userId)

      // Remove the user from any other subscription
      const others = await repo
        .createQueryBuilder('subscription')
        .innerJoin('subscription.users', 'user')
        .where('subscription.id != :subscriptionId AND user.id = :userId', {
          subscriptionId,
          userId
        })
        .getMany()

      await Promise.all(
        others.map((subscription) => {
          return Promise.all([
            repo
              .createQueryBuilder()
              .relation(Subscription, 'users')
              .of(subscription.id)
              .remove(userId),

            // Decrement the user count
            this.decrement(subscription.id, repo)
          ])
        })
      )

      await manager.getRepository(User).update(userId, {
        subscription: { id: subscriptionId }
      })
    })

    // Update's user count & associated subscription
    await this.updateCount(subscriptionId)

    return { success: true }
  }

  async increment(subscriptionId: string, repo: Repository<Subscription>) {
    const subscription = await repo.findOne(subscriptionId)
    await repo.increment({ id: subscriptionId }, 'user_count', 1)
    subscription.user_count = subscription.user_count + 1
    return this.updateChargeBeeCustomer(subscription)
  }

  async decrement(subscriptionId: string, repo: Repository<Subscription>) {
    const subscription = await repo.findOne(subscriptionId)
    await repo.decrement({ id: subscriptionId }, 'user_count', 1)
    subscription.user_count = subscription.user_count - 1
    return this.updateChargeBeeCustomer(subscription)
  }

  async updateCount(subscriptionId: string) {
    const subscriptionUserCount = await this.userRepository.count({
      where: {
        subscription: {
          id: subscriptionId
        }
      }
    })

    await this.subscriptionRepository.update(
      {
        id: subscriptionId
      },
      {
        user_count: subscriptionUserCount
      }
    )

    const subscription = await this.subscriptionRepository.findOne(
      subscriptionId
    )

    await this.updateChargeBeeCustomer(subscription)

    return subscriptionUserCount
  }

  /**
   * Find the default subscription by organisation
   *
   * @param organisation
   * @returns Subscription
   */
  async getDefault(
    organisation: Organisation,
    repository?: Repository<Subscription>
  ) {
    return (repository || this.subscriptionRepository).findOne({
      where: {
        organisation: {
          id: organisation.id
        },
        default: true
      }
    })
  }

  /**
   * Transaction to remove a specific user from the subscription
   * @param userId
   * @param subscriptionId
   * @returns
   */
  async removeUserFromSubscription(
    userId: string,
    subscriptionId: string,
    entityOwner: EntityOwner
  ) {
    return this.subscriptionRepository.manager.transaction(async (manager) => {
      const subscriptionRepository = manager.getRepository(Subscription)
      const userRepository = manager.getRepository(User)
      const subscription = await subscriptionRepository.findOne(
        subscriptionId,
        {
          relations: ['organisation']
        }
      )
      const user = await userRepository.findOne(userId, {
        relations: ['teams', 'teams.organisation']
      })

      if (entityOwner.organisationId) {
        if (subscription.organisation.id !== entityOwner.organisationId) {
          throw new Error('Invalid organisation for subscription')
        }
      }

      // A user cannot be removed from the default subscription
      // They must be moved instead
      if (user.teams.length && subscription.default) {
        return SubscriptionServiceError.CannotDeleteDefault
      }

      // Check if a user belongs to any teams within this organisation
      const teams = user.teams.filter(
        (team) => team.organisation.id === subscription.organisation.id
      )

      // If a user belongs to any teams, they cannot be deleted
      // They will be moved to the default subscription
      if (teams.length) {
        const defaultSubscription = await this.getDefault(
          subscription.organisation,
          subscriptionRepository
        )
        if (defaultSubscription) {
          await subscriptionRepository
            .createQueryBuilder()
            .relation(Subscription, 'users')
            .of(defaultSubscription)
            .add(userId)

          await userRepository.update(userId, {
            subscription: { id: defaultSubscription.id }
          })

          // Increment the user count
          await this.increment(defaultSubscription.id, subscriptionRepository)
        } else {
          return SubscriptionServiceError.NoDefaultAvailable
        }

        // The user belongs to no teams within the subscription's organisation
        // therefore they can be completely removed from the subscription
      } else {
        await userRepository.update(userId, {
          subscription: null
        })
      }

      // Remove the user from the original subscription
      await subscriptionRepository
        .createQueryBuilder()
        .relation(Subscription, 'users')
        .of(subscriptionId)
        .remove(userId)

      // Increment the user count
      await this.decrement(subscriptionId, subscriptionRepository)

      return { success: true }
    })
  }

  /**
   * Creates a subscription for the organisation with users
   * @param createDefaultDto
   * @param orgId
   * @param subId
   */
  async assignUsers(
    updateSubscriptionDto: UpdateSubscriptionDto,
    orgId: string,
    subId: string,
    teamId?: string
  ): Promise<Subscription> {
    const subscription = await this.findOne(orgId, subId)

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    let subscriptionUsers = new Subscription()
    if (!updateSubscriptionDto.usersIdsList) {
      subscriptionUsers = Object.assign(
        subscriptionUsers,
        { ...subscription },
        updateSubscriptionDto
      )
    } else {
      const { usersIdsList, ...rest } = updateSubscriptionDto
      subscriptionUsers = Object.assign(
        subscriptionUsers,
        { ...subscription },
        { ...rest }
      )
    }

    let users = []
    if (teamId) {
      const team = await this.teamRepository.findOne(teamId, {
        relations: ['users']
      })
      users = team.users
    } else if (updateSubscriptionDto.usersIdsList) {
      for (const userId of updateSubscriptionDto.usersIdsList) {
        users.push(await this.userRepository.findOne(userId))
      }
    } else {
      const org = await this.organisationRepository.findOne(orgId, {
        relations: ['teams']
      })
      const teams = org.teams
      teams.forEach(async (team) => {
        const teamWithUsers = await this.teamRepository.findOne(team.id, {
          relations: ['users']
        })
        if (!teamWithUsers.users) {
          throw new BadRequestException('users were not found for this teams')
        }
        users = teamWithUsers.users
      })
    }

    subscriptionUsers.users = users

    return await this.subscriptionRepository.save({
      ...subscription,
      ...subscriptionUsers
    })
  }

  /**
   * Find all subscriptions
   * @param orgId
   * @param subId
   */
  async findAll(
    { limit, page }: PaginationOptionsInterface,
    entityOwner: EntityOwner = {}
  ): Promise<Pagination<Subscription>> {
    const [results, total] = await this.subscriptionRepository.findAndCount({
      relations: ['organisation'],
      take: limit,
      skip: limit * page,
      order: {
        updated_at: 'DESC'
      },
      where: entityOwner.organisationId
        ? {
            organisation: {
              id: entityOwner.organisationId
            }
          }
        : {}
    })

    return new Pagination<Subscription>({
      results,
      total
    })
  }

  /**
   * Find all subscriptions
   * @param orgId
   * @param subId
   */
  async findAllAccessibleBy(
    userId: string,
    { limit, page }: PaginationOptionsInterface,
    entityOwner: EntityOwner = {}
  ): Promise<Pagination<Subscription>> {
    let query = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.organisation', 'organisation')
      .innerJoin(
        UserRole,
        'user_role',
        'user_role.subscriptionId = subscription.id AND user_role.userId = :userId',
        {
          userId
        }
      )
      .take(limit)
      .skip(limit * page)
      .orderBy('updated_at', 'DESC')

    if (entityOwner.organisationId) {
      query = query.where('organisation.id = :organisationId', {
        organisationId: entityOwner.organisationId
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<Subscription>({
      results,
      total
    })
  }

  /**
   * Find all subscription's users
   * @param orgId,
   * @param subId
   */
  async findAllUsers(
    orgId: string,
    subId: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<User>> {
    const subscription = await this.findOne(orgId, subId, [
      'organisation',
      'users'
    ])
    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscription', 'subscription')
      .where('subscription.id = :subId', { subId })
      .leftJoin('subscription.organisation', 'organisation')
      .where('organisation.id = :orgId', { orgId })
      .take(options.limit)
      .skip(options.page * options.limit)

    const [results, total] = await users.getManyAndCount()

    return new Pagination<User>({
      results,
      total
    })
  }

  /**
   * Remove subscription's user
   * @param orgId,
   * @param subId,
   * @param userId
   */
  async removeUser(
    orgId: string,
    subId: string,
    userId: string
  ): Promise<Subscription> {
    const subscription = await this.findOne(orgId, subId, [
      'organisation',
      'users'
    ])
    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    const user = await this.userRepository.findOne(userId)
    if (!user) {
      throw new BadRequestException("user doesn't exist")
    }
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'subscription')
      .of(userId)
      .set(null)

    return await this.findOne(orgId, subId, ['organisation', 'users'])
  }

  /**
   * Updates the subscription with a Chargebee Customer
   * OR creates one if it does not exist.
   *
   * Also creates a subscription on the Fitlink Teams plan
   * for the customer, using the current user_count
   *
   * @param subscription
   * @returns
   */

  async updateChargeBeeCustomer(subscription: Subscription): Promise<Customer> {
    if (subscription.billing_plan_customer_id) {
      if (subscription.type !== SubscriptionType.Free) {
        // Update the customers' information
        const customer = await this.chargebeeUpdateCustomer(subscription)

        // Subscribe the customer
        if (!subscription.billing_plan_subscription_id) {
          const chargebeeSubscription = await this.createChargebeeSubscription(
            subscription,
            subscription.billing_plan_customer_id
          )
          await this.subscriptionRepository.update(subscription.id, {
            billing_plan_subscription_id: chargebeeSubscription.id,
            billing_plan_status: BillingPlanStatus.Active
          })
        } else {
          // Primarily used for updating the number of seats on the plan
          await this.updateChargebeeSubscription(subscription)
        }

        return customer
      } else {
        // The subscription was converted to a free plan
        // Cancel the associated subscription
        if (subscription.billing_plan_subscription_id) {
          await this.chargebeeCancelSubscription(subscription)
        }
      }
    } else if (subscription.type !== SubscriptionType.Free) {
      // Creating a brand new customer on ChargeBee
      const customer = await this.chargebeeCreateCustomer(subscription)

      // Also create the subscription for the new customer
      const chargebeeSubscription = await this.createChargebeeSubscription(
        subscription,
        customer.id
      )

      await this.subscriptionRepository.update(subscription.id, {
        billing_plan_subscription_id: chargebeeSubscription.id,
        billing_plan_customer_id: customer.id
      })

      return customer
    }
  }

  /**
   * Creates billing setup and ChargeBee plan for the subscription
   * @param orgId,
   * @param subId,
   */
  async setupBilling(
    orgId: string,
    subId: string,
    chargeBeePlan = false
  ): Promise<any> {
    const subscription = await this.findOne(orgId, subId, ['organisation'])

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    if (chargeBeePlan) {
      const customer: Customer = await this.chargeBeePostRequest<any>(
        '/customers',
        {
          allow_direct_debit: true,
          first_name: subscription.billing_first_name,
          last_name: subscription.billing_last_name,
          company: subscription.billing_entity,
          email: subscription.billing_email,
          'billing_address[line1]': subscription.billing_address_1,
          'billing_address[line2]': subscription.billing_address_2,
          'billing_address[city]': subscription.billing_city,
          'billing_address[state]': subscription.billing_state,
          'billing_address[country]': subscription.billing_country_code,
          'billing_address[zip]': subscription.billing_postcode
        }
      )

      return {
        countUsers: subscription.user_count,
        customer: customer
      }
    } else {
      return {
        countUsers: subscription.user_count
      }
    }
  }

  /**
   * Getting ChargeBee plan for the subscription
   * @param orgId,
   * @param subId,
   * @param customerId: string
   */
  async getChargebeePlan(
    orgId: string,
    subId: string,
    customerId: string
  ): Promise<any> {
    const subscription = await this.findOne(orgId, subId, ['organisation'])

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    const result = await this.chargeBeeGetRequest<{ customer: Customer }>(
      `/customers/${customerId}`
    )
    return result.customer
  }

  async createChargebeeSubscription(
    subscription: Subscription,
    customerId: string
  ) {
    const daysUsed = differenceInDays(subscription.created_at, new Date())
    const result: {
      subscription: ChargebeeSubscription
    } = await this.chargeBeePostRequest<any>(
      `/customers/${customerId}/subscriptions`,
      {
        plan_id: this.configService.get('CHARGEBEE_PLAN_ID'),
        free_period: daysUsed > 0 ? 14 - daysUsed : 0,

        // Plan quantity needs to be minimum 1
        plan_quantity: subscription.user_count || 1
      }
    )

    return result.subscription
  }

  async updateChargebeeSubscription(subscription: Subscription) {
    const result: {
      subscription: ChargebeeSubscription
    } = await this.chargeBeePostRequest<any>(
      `/subscriptions/${subscription.billing_plan_subscription_id}`,
      {
        // Plan quantity needs to be minimum 1
        plan_quantity: subscription.user_count || 1
      }
    )

    return result.subscription
  }

  async getChargebeeSubscription(subscription: Subscription) {
    try {
      const result: {
        subscription: ChargebeeSubscription
      } = await this.chargeBeeGetRequest<any>(
        `/subscriptions/${subscription.billing_plan_subscription_id}`
      )
      return result
    } catch (e) {
      throw new BadRequestException(e)
    }
  }

  /**
   * Removing ChargeBee plan for the subscription
   * @param orgId,
   * @param subId,
   * @param customerId: string
   */
  async removeChargebeePlan(
    orgId: string,
    subId: string,
    customerId: string
  ): Promise<any> {
    const subscription = await this.findOne(orgId, subId, [
      'organisation',
      'users'
    ])

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    return this.chargeBeePostRequest(`/${customerId}/delete`)
  }

  /**
   * Gets the hosted page response for a subscription
   * with an associated chargebee customer id
   *
   * @param subId
   * @returns
   */
  async getChargebeeHostedPage(
    subId: string
  ): Promise<SubscriptionServiceError | HostedPage> {
    const subscription = await this.findOneSubscription(subId)

    if (!subscription.billing_plan_customer_id) {
      return SubscriptionServiceError.CustomerNotFound
    }

    const result = await this.chargeBeePostRequest<any>(
      `/hosted_pages/manage_payment_sources`,
      {
        'customer[id]': subscription.billing_plan_customer_id
      }
    )

    return result.hosted_page
  }

  /**
   * Get chargebee payment sources
   *
   * @param subId
   * @returns
   */
  async getChargebeePaymentSources(
    subId: string
  ): Promise<
    | {
        results: PaymentSource[]
        pageTotal: number
        total: number
      }
    | SubscriptionServiceError
  > {
    const subscription = await this.findOneSubscription(subId)

    if (!subscription.billing_plan_customer_id) {
      return SubscriptionServiceError.CustomerNotFound
    }

    const result = await this.chargeBeeGetRequest<{
      list: { payment_source: PaymentSource }[]
    }>(`/payment_sources`, {
      'customer_id[is]': subscription.billing_plan_customer_id
    })

    const list = result.list || []

    return {
      results: list.map((each) => each.payment_source),
      pageTotal: list.length,
      total: list.length
    }
  }

  async getChargebeeInvoices(subscription: Subscription, offset?: string) {
    if (!subscription.billing_plan_customer_id) {
      throw new BadRequestException('Customer billing not yet created')
    }

    const result = await this.chargeBeeGetRequest<{
      list: { invoice: Invoice }[]
      next_offset: string
    }>(`/invoices`, {
      'customer_id[is]': subscription.billing_plan_customer_id,
      'subscription_id[is]': subscription.billing_plan_subscription_id,
      offset
    })

    const list = result.list || []

    return {
      results: list.map((each) => each.invoice),
      pageTotal: list.length,
      total: list.length
    }
  }

  /**
   * Verifies the token and responds to the invitation
   * either accepts or declines.
   *
   * @param token
   * @returns object (SubscriptionsInvitation)
   */

  async respondToInvitation(token: string, accept: boolean, userId: string) {
    const invitation = await this.invitationsService.verifyToken(token)

    if (typeof invitation === 'string') {
      return invitation
    }

    const roles = await this.userRolesService.getAllUserRoles(userId)

    const alreadyAdmin = roles.filter(
      (e) => e.subscription && e.subscription.id === invitation.subscription.id
    ).length

    // Delete the invitation if the user is already a member
    if (alreadyAdmin) {
      await this.invitationsService.remove(invitation.id)
      invitation.accepted = true
      return invitation
    }

    if (accept) {
      await this.userRolesService.assignAdminRole(
        userId,
        {
          subscriptionId: invitation.subscription.id
        },
        false
      )
      return this.invitationsService.accept(invitation)
    } else {
      return this.invitationsService.decline(invitation)
    }
  }

  /**
   * Assign admin role to subscription
   */
  async assignAdmin(subscriptionId: string, userId: string) {
    return this.userRolesService.assignAdminRole(
      userId,
      { subscriptionId },
      false
    )
  }

  async chargebeeGeneratedInvoiceLink(invoiceId: string) {
    const result = await this.chargeBeePostRequest<{
      download: { download_url: string }
    }>(`/invoices/${invoiceId}/pdf`)
    return result.download
  }

  async chargebeeCancelSubscription(subscription: Subscription) {
    await this.chargeBeePostRequest(
      `/subscriptions/${subscription.billing_plan_subscription_id}/cancel`
    )
  }

  async chargebeeUpdateCustomer(subscription: Subscription) {
    const customerId = subscription.billing_plan_customer_id

    const address = {
      'billing_address[line1]': subscription.billing_address_1,
      'billing_address[line2]': subscription.billing_address_2,
      'billing_address[city]': subscription.billing_city,
      'billing_address[state]': subscription.billing_state,
      'billing_address[country]': subscription.billing_country_code,
      'billing_address[postcode]': subscription.billing_postcode
    }

    const [update] = await Promise.all([
      this.chargeBeePostRequest<any>(`/customers/${customerId}`, {
        allow_direct_debit: true,
        company: subscription.billing_entity,
        first_name: subscription.billing_first_name,
        last_name: subscription.billing_last_name,
        email: subscription.billing_email,
        preferred_currency_code: subscription.billing_currency_code
      }),
      this.chargeBeePostRequest<any>(
        `/customers/${customerId}/update_billing_info`,
        address
      )
    ])

    return update.customer as Customer
  }

  /**
   * Creates a new ChargeBee customer
   *
   * This endpoint allows adding the billing address directly.
   * Future updates use the update_billing_info endpoint.
   *
   * @param subscription
   * @returns
   */

  async chargebeeCreateCustomer(subscription: Subscription) {
    // Creating a brand new customer on ChargeBee
    const {
      customer
    }: { customer: Customer } = await this.chargeBeePostRequest<any>(
      '/customers',
      {
        allow_direct_debit: true,
        first_name: subscription.billing_first_name,
        last_name: subscription.billing_last_name,
        company: subscription.billing_entity,
        email: subscription.billing_email,
        'billing_address[line1]': subscription.billing_address_1,
        'billing_address[line2]': subscription.billing_address_2,
        'billing_address[city]': subscription.billing_city,
        'billing_address[state]': subscription.billing_state,
        'billing_address[country]': subscription.billing_country_code,
        'billing_address[zip]': subscription.billing_postcode
      }
    )

    return customer
  }

  async chargeBeeGetRequest<T>(url: string, params: NodeJS.Dict<any> = {}) {
    try {
      const result = await this.httpService
        .get(
          `https://${this.configService.get(
            'CHARGEBEE_API_SITE'
          )}.chargebee.com/api/v2${url}`,
          {
            auth: {
              username: this.configService.get('CHARGEBEE_API_KEY'),
              password: ''
            },
            params
          }
        )
        .toPromise()
      return result.data as T
    } catch (e) {
      if (e.response) {
        console.error(e.response.data)
        throw new HttpException(e, e.response.data.http_status_code)
      } else {
        throw new BadRequestException(e)
      }
    }
  }

  async chargeBeePostRequest<T>(url: string, params: Partial<T> = {}) {
    try {
      const result = await this.httpService
        .post(
          `https://${this.configService.get(
            'CHARGEBEE_API_SITE'
          )}.chargebee.com/api/v2${url}`,
          {},
          {
            auth: {
              username: this.configService.get('CHARGEBEE_API_KEY'),
              password: ''
            },
            params: params
          }
        )
        .toPromise()
      return result.data as T
    } catch (e) {
      if (e.response) {
        console.error(e.response.data)
        throw new HttpException(e, e.response.data.http_status_code)
      } else {
        throw new BadRequestException(e)
      }
    }
  }
}
