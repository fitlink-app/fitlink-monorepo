import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { UsersService } from '../../users/users.service'
import { DialyGoalsReachedEvent } from '../events/daily-goals-reached.event'

@Injectable()
export class DailyGoalReachedListener {
  constructor(
    private userService: UsersService,
    private feedItemService: FeedItemsService
  ) {}

  @OnEvent('daily_goal.reached')
  async triggerGoalEntriesUpdate(payload: DialyGoalsReachedEvent) {
    const { goal_entry, userId, goal_type } = payload
    const user = await this.userService.findOne(userId)
    console.log('EVENT TRIGGERED!!!!!!!!!!!!!')
    await this.feedItemService.create({
      category: FeedItemCategory.MyGoals,
      type: FeedItemType.DailyGoalReached,
      user,
      goal_entry,
      goal_type
    })
  }
}
