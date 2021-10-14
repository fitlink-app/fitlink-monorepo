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
import { User } from '../../users/entities/user.entity'
import { Reward } from '../entities/reward.entity'
import { RewardClaimedEvent } from '../events/reward-claimed.event'
import { Events } from '../../../../src/events'

@Injectable()
export class RewardClaimedListener {
  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private feedItemService: FeedItemsService
  ) {}
  @OnEvent(Events.REWARD_CLAIMED)
  async onRewardClaimed({ rewardId, userId }: RewardClaimedEvent) {
    const reward = await this.rewardRepository.findOne({ id: rewardId })
    const user = await this.usersRepository.findOne({ id: userId })
    const [_, error] = await tryAndCatch(
      this.feedItemService.create({
        type: FeedItemType.RewardClaimed,
        category: FeedItemCategory.MyUpdates,
        user,
        reward
      })
    )
    error && console.error(error)
  }
}
