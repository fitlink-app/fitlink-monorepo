import { Injectable } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
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
import { Events } from '../../../../src/events'
import { UserActiveMinutesWeekIncrementedEvent } from '../events/user-active-minutes-week-incremented.event'
import { FeedItem } from '../../feed-items/entities/feed-item.entity'
import { NotificationsService } from '../../notifications/notifications.service'
import { NotificationAction } from '../../notifications/notifications.constants'

@Injectable()
export class UserPointsIncrementedListener {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rewardsService: RewardsService,
    private feedItemService: FeedItemsService,
    private eventEmitter: EventEmitter2,
    private notificationsService: NotificationsService
  ) {}

  @OnEvent(Events.USER_POINTS_INCREMENTED)
  async onUserPointsIncremented(payload: UserPointsIncrementedEvent) {
    const user = await this.usersRepository.findOne({ id: payload.user_id })

    await this.incrementWeeklyPointsAndMinutes(
      user,
      payload.active_time,
      payload.new_points - payload.prev_points
    )
    const {
      points_until_reward,
      reward
    } = await this.rewardsService.getPointsUntilNextReward(
      user.id,
      payload.prev_points
    )
    if (!reward) {
      console.log('No reward found, no feed entry required')
      return null
    }

    // if payload.new_points is bigger or equal to points_until_reward
    if (payload.new_points >= points_until_reward) {
      await this.addFeedItem(user, reward)
      await this.sendNotification(user, reward)
    }
  }

  async incrementWeeklyPointsAndMinutes(
    user: User,
    active_time: number,
    additional_points: number
  ) {
    const [updatedUser, error] = await tryAndCatch(
      this.usersRepository.save({
        ...user,
        active_minutes_week: Math.ceil(
          user.active_minutes_week + active_time / 60
        ),
        points_week: user.points_week + additional_points
      })
    )
    const event = new UserActiveMinutesWeekIncrementedEvent()
    event.userId = updatedUser.id
    await this.eventEmitter.emitAsync(
      Events.USER_ACTIVE_MINUTES_WEEK_INCREMENTED,
      event
    )

    error && console.error(error)
  }

  async addFeedItem(user: User, reward: Reward) {
    const [_, error] = await tryAndCatch<FeedItem>(
      this.feedItemService.create({
        category: FeedItemCategory.MyUpdates,
        type: FeedItemType.RewardUnlocked,
        user,
        reward
      })
    )
    error && console.error(error)
  }

  async sendNotification(user: User, reward: Reward) {
    const [_, error] = await tryAndCatch(
      this.notificationsService.create({
        action: NotificationAction.RewardUnlocked,
        subject: reward.name,
        subject_id: reward.id,
        avatar: reward.image,
        user: user
      })
    )
    error && console.error(error)
  }
}
