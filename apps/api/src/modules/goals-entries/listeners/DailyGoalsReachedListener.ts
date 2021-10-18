import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Events } from '../../../../src/events'
import {
  FeedItemCategory,
  FeedItemType,
  FeedGoalTypeFormat
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { NotificationAction } from '../../notifications/notifications.constants'
import { NotificationsService } from '../../notifications/notifications.service'
import { UsersService } from '../../users/users.service'
import { DailyGoalsReachedEvent } from '../events/daily-goals-reached.event'
import { GoalsEntriesService } from '../goals-entries.service'

@Injectable()
export class DailyGoalReachedListener {
  constructor(
    private userService: UsersService,
    private feedItemService: FeedItemsService,
    private goalEntryService: GoalsEntriesService,
    private notificationsService: NotificationsService
  ) {}

  @OnEvent(Events.DAILY_GOAL_REACHED)
  async triggerGoalEntriesUpdate(payload: DailyGoalsReachedEvent) {
    const { goalEntryId, userId, goal_type } = payload
    const user = await this.userService.findOne(userId)
    const goal_entry = await this.goalEntryService.findOne(goalEntryId)

    try {
      // Create feed item
      await this.feedItemService.create({
        category: FeedItemCategory.MyGoals,
        type: FeedItemType.DailyGoalReached,
        user,
        goal_entry,
        goal_type
      })

      // Send push notification
      await this.notificationsService.create({
        action: NotificationAction.GoalAchieved,
        subject: FeedGoalTypeFormat[goal_type],
        subject_id: goal_entry.id,
        user
      })
    } catch (e) {
      console.error(e)
    }
  }
}
