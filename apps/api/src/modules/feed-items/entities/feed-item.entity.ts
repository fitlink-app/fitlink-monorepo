import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  Column,
  JoinColumn
} from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { GoalsEntry } from '../../goals-entries/entities/goals-entry.entity'
import { League } from '../../leagues/entities/league.entity'

export enum FeedItemCategory {
  MyActivities = 'my_activities',
  MyGoals = 'my_goals',
  MyUpdates = 'my_updates',
  FriendsActivities = 'friends_activities'
}

export enum FeedItemType {
  DailyGoalReached = 'daily_goal_reached',
  HealthActivity = 'health_activity',
  NewFollower = 'new_follower',
  LeagueJoined = 'league_joined',
  LeagueEnding = 'league_ending',
  LeagueWon = 'league_won',
  LeagueReset = 'league_reset',
  RewardUnlocked = 'reward_unlocked',
  RewardClaimed = 'reward_claimed',
  TierUp = 'tier_up',
  TierDown = 'tier_down'
}

export enum UserTier {
  tier1 = 'Fitlink Newbie',
  tier2 = 'Fitlink Pro'
}

export enum FeedGoalType {
  Steps = 'steps',
  FloorsClimbed = 'floors_climbed',
  WaterLitres = 'water_litres',
  SleepHours = 'sleep_hours',
  MindfulnessMinutes = 'mindfulness_minutes'
}

@Entity()
export class FeedItem extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: FeedItemCategory
  })
  category: FeedItemCategory

  @Column({
    type: 'enum',
    enum: FeedItemType
  })
  group: FeedItemType

  @ManyToOne(() => HealthActivity, (activity) => activity.feed_items)
  @JoinColumn()
  health_activity?: HealthActivity

  @ManyToOne(() => League, (league) => league.feed_items)
  @JoinColumn()
  league?: League

  @ManyToOne(() => GoalsEntry, (entry) => entry.feed_items)
  @JoinColumn()
  goal_entry?: GoalsEntry

  @Column({
    type: 'enum',
    enum: FeedGoalType,
    nullable: true
  })
  @JoinColumn()
  goal_type?: FeedGoalType

  @ManyToOne(() => User, (user) => user.feed_items)
  @JoinColumn()
  user: User
}
