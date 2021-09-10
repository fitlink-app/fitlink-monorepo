import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { CreateDefaultSubscriptionDto } from './dto/create-default-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { Subscription } from './entities/subscription.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { ChargeBee } from 'chargebee-typescript'
import {
  Customer,
  CustomerBillingAddress,
  HostedPage,
  PaymentSource
} from 'chargebee-typescript/lib/resources'
import { SubscriptionType } from './subscriptions.constants'
import { SuccessResultDto } from '../../classes/dto/success'

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

const chargebee = new ChargeBee()

chargebee.configure({
  site: 'fitlinkapp-test',
  api_key: 'test_BeVUqNaub4Rujsuyj15TtXcL9T8eMG66'
})
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
    private userRepository: Repository<User>
  ) {}

  /**
   * Creates a subscription for the organisation
   * @param createDefaultDto
   * @param organisationId
   */
  async createDefault(
    createDefaultDto: CreateDefaultSubscriptionDto,
    organisationId: string
  ): Promise<Subscription> {
    const { billing_entity, ...rest } = createDefaultDto
    const org = await this.organisationRepository.findOne(organisationId)

    let subscription = new Subscription()
    subscription.organisation = org
    subscription.billing_entity = billing_entity
    subscription.default = true

    if (rest) {
      subscription = Object.assign(subscription, { ...rest })
    }

    const result = await this.subscriptionRepository.findOne(subscription)
    return await this.subscriptionRepository.save({
      ...result,
      ...subscription
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
    let update: Partial<Subscription> = dto

    const subscription = await this.subscriptionRepository.findOne(subId, {
      relations: ['organisation']
    })

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
    if (
      !subscription.billing_plan_customer_id &&
      subscription.type === SubscriptionType.Dynamic
    ) {
      const customer = await this.updateChargeBeeCustomer(subscription)
      update.billing_plan_customer_id = customer.id
    } else {
      // Update the ChargeBee customer
      await this.updateChargeBeeCustomer(subscription)
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
  async deleteSubscription(subId: string) {
    const subscription = await this.findOneSubscription(subId)
    if (subscription.default) {
      return SubscriptionServiceError.CannotDeleteDefault
    }

    return this.subscriptionRepository.delete(subscription.id)
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

    return this.subscriptionRepository.manager.transaction(async (manager) => {
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
          return repo
            .createQueryBuilder()
            .relation(Subscription, 'users')
            .of(subscription.id)
            .remove(userId)
        })
      )

      await manager.getRepository(User).update(userId, {
        subscription: { id: subscriptionId }
      })

      return { success: true }
    })
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
      if (subscription.default) {
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

  async updateChargeBeeCustomer(subscription: Subscription): Promise<Customer> {
    const chargebeeCustomer: Partial<Customer> = {
      company: subscription.billing_entity,
      first_name: subscription.billing_first_name,
      last_name: subscription.billing_last_name,
      preferred_currency_code: subscription.billing_currency_code
    }

    const address: Partial<CustomerBillingAddress> = {
      company: subscription.billing_entity,
      line1: subscription.billing_address_1,
      line2: subscription.billing_address_2,
      city: subscription.billing_city,
      state: subscription.billing_state,
      country: subscription.billing_country_code,
      zip: subscription.billing_postcode
    }

    if (subscription.billing_plan_customer_id) {
      if (subscription.type === SubscriptionType.Dynamic) {
        const customer = await getPromise(
          chargebee.customer.update(subscription.billing_plan_customer_id, {
            allow_direct_debit: true,
            ...chargebeeCustomer
          })
        )

        await getPromise(
          chargebee.customer.update_billing_info(
            subscription.billing_plan_customer_id,
            {
              billing_address: address
            }
          )
        )

        return customer
      } else {
        // The plan type has changed which means we need to delete the customer
        return getPromise(
          chargebee.customer.update(subscription.billing_plan_customer_id, {
            allow_direct_debit: true,
            ...chargebeeCustomer
          })
        )
      }
    } else if (subscription.type === SubscriptionType.Dynamic) {
      return getPromise(
        chargebee.customer.create({
          allow_direct_debit: true,
          billing_address: address,
          ...chargebeeCustomer
        })
      )
    }

    function getPromise(request: any): Promise<Customer> {
      return new Promise((resolve, reject) => {
        request.request((error, result) => {
          if (error) {
            reject(error)
          } else {
            const customer = result.customer as Customer
            resolve(customer)
          }
        })
      })
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
    const subscription = await this.findOne(orgId, subId, [
      'organisation',
      'users'
    ])

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    let countUsers
    if (subscription.users.length > 0) {
      countUsers = subscription.users.length
    } else {
      throw new BadRequestException('the subscription has no users')
    }

    if (chargeBeePlan) {
      const chargebeeCustomer = {
        company: subscription.billing_entity,
        billing_address: {
          company: subscription.billing_entity,
          line1: subscription.billing_address_1,
          line2: subscription.billing_address_2,
          city: subscription.billing_city,
          state: subscription.billing_state,
          country: subscription.billing_country_code,
          zip: subscription.billing_postcode
        }
      }
      const chargebeeCustomerCreate = new Promise((resolve, reject) => {
        chargebee.customer
          .create({
            allow_direct_debit: true,
            ...chargebeeCustomer
          })
          .request((error, result: any) => {
            if (error) {
              reject(error)
            } else {
              const customer: typeof chargebee.customer = result.customer
              resolve({ customer })
            }
          })
      })
      return {
        countUsers: countUsers,
        customer: await chargebeeCustomerCreate
      }
    } else {
      return {
        countUsers: countUsers
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
    const subscription = await this.findOne(orgId, subId, [
      'organisation',
      'users'
    ])

    if (!subscription) {
      throw new BadRequestException(
        "the subscription doesn't exist for this organisation"
      )
    }

    const chargebeeCustomer = new Promise((resolve, reject) => {
      chargebee.customer.retrieve(customerId).request((error, result: any) => {
        if (error) {
          reject(error)
        } else {
          const customer: typeof chargebee.customer = result.customer
          resolve({ customer })
        }
      })
    })
    return await chargebeeCustomer
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

    const chargebeeCustomer = new Promise((resolve, reject) => {
      chargebee.customer.delete(customerId).request((error, result: any) => {
        if (error) {
          reject(error)
        } else {
          const customer: typeof chargebee.customer = result.customer
          resolve({ customer })
        }
      })
    })
    return await chargebeeCustomer
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

    return new Promise((resolve, reject) => {
      chargebee.hosted_page
        .manage_payment_sources({
          customer: {
            id: subscription.billing_plan_customer_id
          }
        })
        .request((error: ChargebeeError, result: any) => {
          if (error) {
            reject(error)
          } else {
            const hostedPage: HostedPage = result.hosted_page

            resolve(hostedPage)
          }
        })
    })
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

    return new Promise((resolve, reject) => {
      chargebee.payment_source
        .list({
          customer_id: {
            is: subscription.billing_plan_customer_id
          },
          status: { is: 'valid' }
        })
        .request((error: ChargebeeError, result: { list: PaymentSource[] }) => {
          if (error) {
            reject(error)
          } else {
            resolve({
              results: result.list,
              pageTotal: result.list.length,
              total: result.list.length
            })
          }
        })
    })
  }
}
