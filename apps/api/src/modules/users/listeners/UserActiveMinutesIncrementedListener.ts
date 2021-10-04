import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Events } from '../.../../../../../src/events'
import { Repository } from 'typeorm'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { User } from '../entities/user.entity'
import { UserActiveMinutesWeekIncrementedEvent } from '../events/user-active-minutes-week-incremented.event'
import { UsersService } from '../users.service'
import { UserRank } from '../users.constants'
import { tryAndCatch } from '../../../../src/helpers/tryAndCatch'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'

@Injectable()
export class UserActiveMinutesIncrementedListener {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private feedItemService: FeedItemsService,
    private userService: UsersService
  ) {}

  @OnEvent(Events.USER_ACTIVE_MINUTES_WEEK_INCREMENTED)
  async onUserActiveMinutesWeekIncremented({
    userId
  }: UserActiveMinutesWeekIncrementedEvent) {
    const user = await this.userRepository.findOne(userId)
    const calculatedRank = await this.userService.calculateUserRank(user.id)

    const isEligibleForPromotion = await this.isEligibleForPromotion(
      user,
      calculatedRank
    )

    return isEligibleForPromotion
      ? await this.promote(user, calculatedRank)
      : null
  }

  async addFeedItem(user: User, newRank: UserRank) {
    const [feedItem, error] = await tryAndCatch(
      this.feedItemService.create({
        category: FeedItemCategory.MyUpdates,
        type: FeedItemType.TierUp,
        user,
        tier: newRank
      })
    )
    error && console.log(error)
  }

  // promote the user with the new rank
  async promote(user: User, newRank: UserRank) {
    const [promotedUser, err] = await tryAndCatch(
      this.userRepository.save({
        ...user,
        rank: newRank
      })
    )
    err && console.log(err)
    await this.addFeedItem(user, newRank)
  }

  async isEligibleForPromotion(user: User, calculatedRank: UserRank) {
    const calculatedRankNumber = this.rankToNumber(calculatedRank)
    const userRankNumber = this.rankToNumber(user.rank)
    return userRankNumber < calculatedRankNumber
  }

  rankToNumber(rank: UserRank): number {
    return rank === UserRank.Tier1
      ? 1
      : rank === UserRank.Tier2
      ? 2
      : rank === UserRank.Tier3
      ? 3
      : 4
  }
}
