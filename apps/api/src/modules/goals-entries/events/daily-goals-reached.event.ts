import { FeedGoalType } from '../../feed-items/feed-items.constants'

export class DailyGoalsReachedEvent {
  userId: string
  goalEntryId: string
  goal_type: FeedGoalType
}
