import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, FindOperator, IsNull, MoreThan, Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { Image } from '../images/entities/image.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { RewardsRedemption } from '../rewards-redemptions/entities/rewards-redemption.entity'
import { Team } from '../teams/entities/team.entity'
import { User } from '../users/entities/user.entity'
import { CreateRewardDto } from './dto/create-reward.dto'
import { UpdateRewardDto } from './dto/update-reward.dto'
import { Reward, RewardPublic, RewardNext } from './entities/reward.entity'
import { RewardAccess } from './rewards.constants'
import { startOfDay, startOfToday } from 'date-fns'
import {
  RewardFiltersDto,
  RewardGlobalFilterDto
} from './dto/reward-filters.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RewardClaimedEvent } from './events/reward-claimed.event'
import { Events } from '../../events'
import { FeedItem } from '../feed-items/entities/feed-item.entity'

type EntityOwner = {
  organisationId?: string
  teamId?: string
}

type ParentIds = {
  organisationId?: string
  teamId?: string
}

type QueryOptions = {
  checkExpiry?: boolean
  checkAvailability?: boolean
  isPrivateOnly?: boolean
}

type PublicPageReward = {
  photo_url: string
  description: string
  title: string
  title_short: string
  points_required: number
  brand: string
  reward_expires_at: Date
}

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepository: Repository<Reward>,
    @InjectRepository(RewardsRedemption)
    private rewardsRedemptionRepository: Repository<RewardsRedemption>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2
  ) {}

  create(createRewardDto: CreateRewardDto) {
    const { teamId, organisationId, imageId } = createRewardDto

    const reward = this.rewardsRepository.create(createRewardDto)

    // Set the image relationship
    if (imageId) {
      const image = new Image()
      image.id = imageId
      reward.image = image
    }

    if (teamId) {
      const team = new Team()
      team.id = teamId
      reward.team = team
      reward.access = RewardAccess.Team
    } else if (organisationId) {
      const organisation = new Organisation()
      organisation.id = organisationId
      reward.organisation = organisation
      reward.access = RewardAccess.Organisation
    }

    return this.rewardsRepository.save(reward)
  }

  async countUnclaimedForUser(userId: string) {
    return this.queryFindAccessibleToUser(userId)
      .andWhere('redemptions.id IS NULL')
      .andWhere('reward.points_required <= user.points_total')
      .getCount()
  }

  /**
   * Finds rewards that are accessible to the user
   * and still available / not expired.
   *
   * @param userId
   * @param param1
   * @returns
   */
  async findManyAccessibleToUser(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    filters: RewardFiltersDto
  ) {
    let query = this.queryFindAccessibleToUser(userId, {
      isPrivateOnly: filters.isPrivateOnly,
      checkExpiry: true,
      checkAvailability: true
    })

    // Where rewards are not available (not enough points) and not redeemed
    if (filters.locked) {
      query = query
        .andWhere('redemptions.id IS NULL')
        .andWhere('reward.points_required > user.points_total')
        .andWhere('reward.bfit_required > user.bfit_balance')
    }

    // Where rewards are available (enough points) but not redeemed
    if (filters.available) {
      query = query
        .andWhere('redemptions.id IS NULL')
        .andWhere('reward.points_required <= user.points_total')
    }

    // Where rewards are expired
    if (filters.expired) {
      // Do not check for expiry
      query = this.queryFindAccessibleToUser(userId, {
        checkExpiry: false
      })

      query = query.andWhere('reward.reward_expires_at < :date', {
        date: startOfDay(new Date())
      })
    }

    query = query
      .take(limit)
      .skip(page * limit)
      .orderBy('reward.points_required', 'ASC')

    const [results, total] = await query.getManyAndCount()

    return new Pagination<RewardPublic>({
      results: results.map(this.getRewardPublic),
      total
    })
  }

  /**
   * Points to next reward
   *
   * Where a reward is available, points are 0
   * Where no rewards are available, points are equivalent to lowest available reward
   * When no reward exists, points are 0 and reward is returned as null
   *
   * @param param0
   * @returns
   */
  async getPointsUntilNextReward(
    userId: string,
    before_points?: number
  ): Promise<RewardNext> {
    const user = await this.userRepository.findOne(userId)

    let query = this.queryFindAccessibleToUser(userId)
      .andWhere('redemptions.id IS NULL')
      .orderBy('reward.points_required', 'ASC')

    if (before_points) {
      query = query.andWhere('reward.points_required >= :points', {
        points: before_points
      })
    }

    const reward = await query.getOne()

    let points = 0
    if (reward && reward.points_required > user.points_total) {
      points = reward.points_required - user.points_total
    }

    const unclaimed_rewards_total = await this.countUnclaimedForUser(userId)

    return {
      reward,
      points_until_reward: points,
      unclaimed_rewards_total
    }
  }

  /**
   * Finds all rewards
   *
   * @param param0
   * @returns
   */
  async findAll(
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    { include_expired_rewards }: RewardGlobalFilterDto = {},
    entityOwner?: EntityOwner
  ) {
    const filters: {
      reward_expires_at?: FindOperator<Date>
    } = {
      reward_expires_at: MoreThan(startOfToday())
    }

    let organisation: Organisation
    if (entityOwner && entityOwner.organisationId) {
      organisation = new Organisation()
      organisation.id = entityOwner.organisationId
    }

    let team: Team
    if (entityOwner && entityOwner.teamId) {
      team = new Team()
      team.id = entityOwner.teamId
    }

    // Include rewards by removing expiry date filtering
    if (include_expired_rewards === '1') {
      delete filters.reward_expires_at
    }

    const [results, total] = await this.rewardsRepository.findAndCount({
      where: {
        team: team ? team : IsNull(),
        organisation: organisation ? organisation : IsNull(),
        ...filters
      },
      relations: ['image', 'team', 'organisation'],
      take: limit,
      skip: page * limit
    })

    return new Pagination<Reward>({
      results,
      total
    })
  }

  /**
   * Builds a query which determines:
   * 1. Whether the reward is public
   * 2. Whether the user belongs to the reward's team (if assigned)
   * 3. Whether the user belongs to a team within the reward's organisation (if assigned)
   *
   * This is used for fetching one and many rewards
   * for any user.
   *
   * This does not take into account availability (units_available)
   * in the case of limited supply rewards, but this condition
   * is applied later in other methods.
   *
   * @param userId
   * @returns
   */
  queryFindAccessibleToUser(
    userId: string,
    options: QueryOptions = {
      checkExpiry: true,
      checkAvailability: true,
      isPrivateOnly: false
    }
  ) {
    let query = this.rewardsRepository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.image', 'image')
      .leftJoinAndSelect('reward.team', 'rewardTeam')
      .leftJoinAndSelect('reward.organisation', 'rewardOrganisation')
      .leftJoinAndSelect(
        'reward.redemptions',
        'redemptions',
        'redemptions.user.id = :userId',
        { userId }
      )
      .leftJoinAndSelect('rewardTeam.avatar', 'rewardTeamAvatar')
      .leftJoin('rewardTeam.users', 'teamUser')
      .leftJoinAndSelect(
        'rewardOrganisation.avatar',
        'rewardOrganisationAvatar'
      )
      .leftJoin('rewardOrganisation.teams', 'organisationTeam')
      .leftJoin('organisationTeam.users', 'organisationUser')
      .leftJoin('user', 'user', 'user.id = :userId', { userId })

      .where(
        new Brackets((qb) => {
          // The reward is public
          const checkedQb = options.isPrivateOnly
            ? qb
            : qb.where('reward.access = :accessPublic')
          return (
            checkedQb
              // The user belongs to the team that the league belongs to
              .orWhere(
                `(reward.access = :accessTeam AND teamUser.id = :userId)`
              )

              // The user belongs to the organisation that the league belongs to
              .orWhere(
                `(reward.access = :accessOrganisation AND organisationUser.id = :userId)`
              )
          )
        }),
        {
          accessPublic: RewardAccess.Public,
          accessTeam: RewardAccess.Team,
          accessOrganisation: RewardAccess.Organisation,
          userId
        }
      )
      .orderBy('reward.reward_expires_at', 'ASC')

    // Check that the reward has not expired
    if (options.checkExpiry === true) {
      query = query.andWhere('reward.reward_expires_at > :date', {
        date: startOfDay(new Date())
      })
    }

    // Check that there's still "stock" available
    if (options.checkAvailability === true) {
      query = query.andWhere(
        '(reward.limit_units = false OR reward.units_available > reward.redeemed_count)'
      )
    }

    return query
  }

  /**
   * Finds a single reward that is accessible to the user
   * and still available / not expired.
   *
   * @param rewardId
   * @param userId
   * @returns
   */
  async findOneAccessibleToUser(
    rewardId: string,
    userId: string,
    options: QueryOptions = {}
  ) {
    let query = this.queryFindAccessibleToUser(userId, options).andWhere(
      'reward.id = :rewardId',
      { rewardId }
    )

    const result = await query.getOne()
    if (result) {
      return this.getRewardPublic(result)
    } else {
      return result
    }
  }

  findOne(rewardId: string) {
    return this.rewardsRepository.findOne(rewardId, {
      relations: ['image', 'team', 'organisation']
    })
  }

  getRewardPublic(reward: Reward) {
    ;(reward as unknown as RewardPublic).redeemed =
      reward.redemptions.length > 0
    return reward as RewardPublic
  }

  /**
   * Updates a reward either by checking it against a team, organisation, or just the id
   * (in the case of a superadmin)
   *
   * Supports changing image
   *
   * @param rewardId
   * @param updateRewardDto
   * @param parentIds (team or organisation)
   * @returns
   */
  async update(
    rewardId: string,
    updateRewardDto: UpdateRewardDto,
    { teamId, organisationId }: ParentIds = {}
  ) {
    let image: Image
    const { imageId, ...fields } = updateRewardDto

    if (imageId) {
      image = new Image()
      image.id = imageId
    }

    if (teamId) {
      // Verify reward belongs to team
      if (!(await this.isTeamReward(rewardId, teamId))) {
        return false
      }

      return this.rewardsRepository.update(
        {
          id: rewardId
        },
        {
          ...fields,

          // Ensure access is correct
          access: RewardAccess.Team,

          // Ensure image is attached (if supplied)
          image
        }
      )
    }

    if (organisationId) {
      // Verify reward belongs to organisation
      if (!(await this.isOrganisationReward(rewardId, organisationId))) {
        return false
      }

      return this.rewardsRepository.update(
        {
          id: rewardId
        },
        {
          ...fields,

          // Ensure access is correct
          access: RewardAccess.Organisation,

          // Ensure image is attached (if supplied)
          image
        }
      )
    }

    return this.rewardsRepository.update(rewardId, {
      ...fields,
      image
    })
  }

  async isTeamReward(rewardId: string, teamId: string) {
    const reward = await this.rewardsRepository.findOne({
      id: rewardId,
      team: { id: teamId }
    })
    return !!reward
  }

  async isOrganisationReward(rewardId: string, organisationId: string) {
    const reward = await this.rewardsRepository.findOne({
      id: rewardId,
      organisation: { id: organisationId }
    })
    return !!reward
  }

  async remove(rewardId: string, { teamId, organisationId }: ParentIds = {}) {
    if (teamId) {
      // Verify reward belongs to team
      if (!(await this.isTeamReward(rewardId, teamId))) {
        return false
      }
    }

    if (organisationId) {
      // Verify reward belongs to organisation
      if (!(await this.isOrganisationReward(rewardId, organisationId))) {
        return false
      }
    }

    return this.rewardsRepository.manager.transaction(async (manager) => {
      // Delete redemptions
      await manager.getRepository(RewardsRedemption).delete({
        reward: {
          id: rewardId
        }
      })

      // Delete related feed items
      await manager.getRepository(FeedItem).delete({
        reward: {
          id: rewardId
        }
      })

      // Finally, delete the reward
      return manager.getRepository(Reward).delete({
        id: rewardId
      })
    })
  }

  /**
   * Uses a transaction to redeem a reward
   * The user must have sufficient points to redeem
   * The points they need to redeem will be decremented from their entity
   *
   * This reward needs to be accessible to the particular user, but the assumption
   * is that this check has already been made in the controller.
   * e.g. using findOneAccessibleToUser
   *
   * @param reward
   * @param userId
   * @returns
   */
  async redeem(reward: Reward, userId: string) {
    // If the reward expires before today
    if (reward.reward_expires_at < startOfDay(new Date())) {
      return 'reward expired'
    }

    if (reward.limit_units && reward.redeemed_count >= reward.units_available) {
      return 'not available'
    }

    const user = await this.userRepository.findOne(userId)
    const redemption = await this.rewardsRedemptionRepository.findOne({
      user: { id: userId },
      reward: { id: reward.id }
    })

    if (redemption) {
      return 'already redeemed'
    }

    if (user.points_total < reward.points_required) {
      return false
    }

    const result = await this.rewardsRepository.manager.transaction(
      async (manager) => {
        const rewardsRedemptionRepository =
          manager.getRepository(RewardsRedemption)
        const userRepository = manager.getRepository(User)
        const rewardRepository = manager.getRepository(Reward)
        const redemption = rewardsRedemptionRepository.create({
          user: { id: userId },
          reward: { id: reward.id }
        })
        const result = await rewardsRedemptionRepository.save(redemption)
        await userRepository.decrement(
          { id: user.id },
          'points_total',
          reward.points_required
        )

        await rewardRepository.increment({ id: reward.id }, 'redeemed_count', 1)

        return result
      }
    )
    if (result) {
      const event = new RewardClaimedEvent()
      event.rewardId = result.reward.id
      event.userId = result.user.id
      await this.eventEmitter.emitAsync(Events.REWARD_CLAIMED, event)
    }
    return result
  }

  /**
   * Finds the user's redeemed rewards
   *
   * Don't include expired rewards, but DO include
   * rewards that are fully redeemed, because the user
   * may want to view these to get the code, etc..
   *
   * @param userId
   * @param param1
   * @returns
   */
  async findRedeemedRewards(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] = await this.queryFindAccessibleToUser(userId, {
      checkExpiry: true,
      checkAvailability: false
    })
      .where('redemptions.user.id = :userId', { userId })
      .take(limit)
      .skip(page * limit)
      .getManyAndCount()

    return new Pagination<RewardPublic>({
      results: results.map(this.getRewardPublic),
      total
    })
  }

  async getTeamRewardsForPublicPage(
    teamId: string
  ): Promise<PublicPageReward[]> {
    const rewards = await this.rewardsRepository
      .createQueryBuilder('reward')
      .where('reward.team.id = :teamId  AND reward.reward_expires_at > :now', {
        teamId,
        now: new Date()
      })
      .orWhere(
        'reward.team IS NULL and reward.organisation IS NULL AND reward.reward_expires_at > :now',
        {
          now: new Date()
        }
      )
      .leftJoinAndSelect('reward.image', 'image')
      .limit(50)
      .getMany()

    return rewards.map((e) => ({
      photo_url: e.image.url,
      brand: e.brand,
      description: e.description,
      points_required: e.points_required,
      reward_expires_at: e.reward_expires_at,
      title: e.name,
      title_short: e.name_short
    }))
  }
}
