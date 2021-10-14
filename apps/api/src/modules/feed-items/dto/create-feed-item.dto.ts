import { GoalsEntry } from '../../goals-entries/entities/goals-entry.entity'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { League } from '../../leagues/entities/league.entity'
import { Reward } from '../../rewards/entities/reward.entity'
import { User } from '../../users/entities/user.entity'
import { UserRank } from '../../users/users.constants'
import {
  FeedGoalType,
  FeedItemCategory,
  FeedItemType
} from '../feed-items.constants'

export class CreateFeedItemDto {
  category: FeedItemCategory
  type: FeedItemType
  tier?: UserRank
  goal_type?: FeedGoalType
  health_activity?: HealthActivity
  league?: League
  reward?: Reward
  related_user?: User
  goal_entry?: GoalsEntry
  user: User
}
