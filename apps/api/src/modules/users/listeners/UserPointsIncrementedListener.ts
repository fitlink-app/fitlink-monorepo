import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { tryAndCatch } from '../../../../src/helpers/tryAndCatch'
import { Repository } from 'typeorm'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { Reward } from '../../rewards/entities/reward.entity'
import { RewardsService } from '../../rewards/rewards.service'
import { User } from '../entities/user.entity'
import { UserPointsIncrementedEvent } from '../events/user-points-incremented.event'

@Injectable()
export class UserPointsIncrementedListener {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rewardsService: RewardsService,
    private feedItemService: FeedItemsService
  ) {}

  @OnEvent('user.points_incremented')
  async onUserPointsIncremented(payload: UserPointsIncrementedEvent) {
    const user = await this.usersRepository.findOne({ id: payload.user_id })
    const {
      points_until_reward,
      reward
    } = await this.rewardsService.getPointsUntilNextReward(user.id)
    if (!reward) {
      console.log('No reward found, no feed entry required')
      return null
    }

    // if the payload.total_points is greater than or equal to the points until the next reward create a new feed item
    payload.total_points >= points_until_reward &&
      (await this.addFeedItem(user, reward))
  }

  async addFeedItem(user: User, reward: Reward) {
    const [_, error] = await tryAndCatch(
      await this.feedItemService.create({
        category: FeedItemCategory.MyUpdates,
        type: FeedItemType.RewardUnlocked,
        user,
        reward
      })
    )
    error && console.error(error)
  }
}
