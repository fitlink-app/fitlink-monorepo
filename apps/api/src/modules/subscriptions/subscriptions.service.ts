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

interface ChargebeeError {
  api_error_code: string
  message: string
  type?: string
  param?: string
}

export enum HostedPageError {
  CustomerNotFound = 'customer_not_found'
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
    private readonly subscriptionsRepository: Repository<Subscription>,

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
    if (rest) {
      subscription = Object.assign(subscription, { ...rest })
    }

    const result = await this.subscriptionsRepository.findOne(subscription)
    return await this.subscriptionsRepository.save({
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
    return await this.subscriptionsRepository.findOne(subId, {
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
    return await this.subscriptionsRepository.findOne(subscription, {
      relations: relations
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

    const subscription = await this.subscriptionsRepository.findOne(subId, {
      relations: ['organisation']
    })

    if (organisationId) {
      update.organisation = new Organisation()
      update.organisation.id = organisationId
    }

    const setToDefault = dto.default === true

    if (setToDefault && subscription.organisation) {
      // Remove default setting on all other subscriptions
      await this.subscriptionsRepository
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

    return await this.subscriptionsRepository.update(subId, update)
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
    return await this.subscriptionsRepository.update(
      subId,
      updateSubscriptionDto
    )
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
      await this.subscriptionsRepository.delete(subscription)
      return 'subscription is deleted'
    }

    await this.subscriptionsRepository
      .createQueryBuilder()
      .relation('users')
      .of(subscription)
      .remove(subscription.users)

    //console.log('subscription after: ', await this.findOne(orgId, subId, ['users']))
    return 'subscription is deleted'
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

    return await this.subscriptionsRepository.save({
      ...subscription,
      ...subscriptionUsers
    })
  }

  /**
   * Find all subscriptions
   * @param orgId
   * @param subId
   */
  async findAll({
    limit,
    page
  }: PaginationOptionsInterface): Promise<Pagination<Subscription>> {
    const [results, total] = await this.subscriptionsRepository.findAndCount({
      relations: ['organisation'],
      take: limit,
      skip: limit * page,
      order: {
        updated_at: 'DESC'
      }
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
  ): Promise<HostedPageError | HostedPage> {
    const subscription = await this.findOneSubscription(subId)

    if (!subscription.billing_plan_customer_id) {
      return HostedPageError.CustomerNotFound
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
    | HostedPageError
  > {
    const subscription = await this.findOneSubscription(subId)

    if (!subscription.billing_plan_customer_id) {
      return HostedPageError.CustomerNotFound
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
