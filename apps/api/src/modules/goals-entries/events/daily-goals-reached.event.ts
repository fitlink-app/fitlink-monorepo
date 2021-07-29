import { FeedGoalType } from '../../feed-items/feed-items.constants'
import { GoalsEntry } from '../entities/goals-entry.entity'

export class DialyGoalsReachedEvent {
  userId: string
  goal_entry: GoalsEntry
  goal_type: FeedGoalType
}
