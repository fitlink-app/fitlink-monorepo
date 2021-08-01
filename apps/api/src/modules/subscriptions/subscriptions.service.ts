import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateDefaultSubscriptionDto } from './dto/create-default-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { Subscription } from './entities/subscription.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { ChargeBee } from 'chargebee-typescript'

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
    const organisation = new Organisation()
    organisation.id = organisationId

    return await this.subscriptionsRepository.update(subId, {
      organisation,
      ...dto
    })
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
   * @param orgId,
   * @param subId
   */
  async findAll({
    limit,
    page
  }: PaginationOptionsInterface): Promise<Pagination<Subscription>> {
    const [results, total] = await this.subscriptionsRepository.findAndCount({
      relations: ['organisation'],
      take: limit,
      skip: limit * page
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
}
