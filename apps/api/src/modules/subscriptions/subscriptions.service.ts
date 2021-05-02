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
    const { billing_entity,  ...rest } = createDefaultDto
    const org = await this.organisationRepository.findOne(organisationId)

    let subscription = new Subscription()
    subscription.organisation = org
    subscription.billing_entity = billing_entity
    if (rest) {
      subscription = Object.assign(subscription, {...rest})
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
      throw new BadRequestException("the subscription doesn't exist for this organisation")
    }
    return await this.subscriptionsRepository.update(subId, updateSubscriptionDto)
  }

  /**
   * Deletes the subscription
   * @param orgId
   * @param subId
   */
     async remove(
      orgId: string,
      subId: string
    ) {
      const subscription = await this.findOne(orgId, subId, ['organisation'])

      if (!subscription) {
        throw new BadRequestException("the subscription doesn't exist for this organisation")
      }

      try {await subscription.users}
      catch {
        await this.subscriptionsRepository.delete(subscription)
        return 'subscription is deleted'
      }

      await this.subscriptionsRepository
        .createQueryBuilder()
        .relation('users')
        .of(subscription)
        .remove(subscription.users);

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
      throw new BadRequestException("the subscription doesn't exist for this organisation")
    }

    let subscriptionUsers = new Subscription()
    subscriptionUsers = Object.assign(subscriptionUsers, {...subscription}, updateSubscriptionDto)

    let users = []
    if (teamId) {
      const team = await this.teamRepository.findOne(teamId, {
        relations: ['users']
      })
      users = team.users
    } else {
      const org = await this.organisationRepository.findOne(orgId, {
        relations: ['teams']
      })
      const teams = org.teams
      teams.forEach(async (team) => {
        const teamWithUsers = await this.teamRepository.findOne(team.id, {
          relations: ['users']
        })
        if(!teamWithUsers.users){
          throw new BadRequestException("users were not found for this teams")
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
   * Find all subscription's users
    * @param orgId,
    * @param subId
   */
  async findAllUsers(
    orgId: string,
    subId: string,
    options: PaginationOptionsInterface
    ): Promise<Pagination<User>> {
      const subscription = await this.findOne(orgId, subId, ['organisation', 'users'])
      if (!subscription) {
        throw new BadRequestException("the subscription doesn't exist for this organisation")
      }

      const users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.subscription', 'subscription')
        .where('subscription.id = :subId', { subId })
        .leftJoin('subscription.organisation', 'organisation')
        .where('organisation.id = :orgId', { orgId })
        .take(options.limit)
        .skip(options.page * options.limit);

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
      const subscription = await this.findOne(orgId, subId, ['organisation', 'users'])
      if (!subscription) {
        throw new BadRequestException("the subscription doesn't exist for this organisation")
      }

      const user = await this.userRepository.findOne(userId)
      if (!user) {
        throw new BadRequestException("user doesn't exist")
      }
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'subscription')
        .of(userId)
        .set(null);

      return await this.findOne(orgId, subId, ['organisation', 'users'])
  }
}
