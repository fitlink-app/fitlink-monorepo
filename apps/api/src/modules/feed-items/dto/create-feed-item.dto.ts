import { GoalsEntry } from '../../goals-entries/entities/goals-entry.entity'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { League } from '../../leagues/entities/league.entity'
import { Reward } from '../../rewards/entities/reward.entity'
import { User } from '../../users/entities/user.entity'
import {
  FeedGoalType,
  FeedItemCategory,
  FeedItemType,
  UserTier
} from '../entities/feed-item.entity'

export class CreateFeedItemDto {
  category: FeedItemCategory
  type: FeedItemType
  tier?: UserTier
  goal_type?: FeedGoalType
  health_activity?: HealthActivity
  league?: League
  reward?: Reward
  realted_user?: User
  goal_entry?: GoalsEntry
  user: User
}
