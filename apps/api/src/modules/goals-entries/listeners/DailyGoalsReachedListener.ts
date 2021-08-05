import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { UsersService } from '../../users/users.service'
import { DailyGoalsReachedEvent } from '../events/daily-goals-reached.event'
import { GoalsEntriesService } from '../goals-entries.service'

@Injectable()
export class DailyGoalReachedListener {
  constructor(
    private userService: UsersService,
    private feedItemService: FeedItemsService,
    private goalEntryService: GoalsEntriesService
  ) {}

  @OnEvent('daily_goal.reached')
  async triggerGoalEntriesUpdate(payload: DailyGoalsReachedEvent) {
    const { goalEntryId, userId, goal_type } = payload
    const user = await this.userService.findOne(userId)
    const goal_entry = await this.goalEntryService.findOne(goalEntryId)
    await this.feedItemService.create({
      category: FeedItemCategory.MyGoals,
      type: FeedItemType.DailyGoalReached,
      user,
      goal_entry,
      goal_type
    })
  }
}
