import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm'

import { Image } from '../../images/entities/image.entity'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { GoalsEntry } from '../../goals-entries/entities/goals-entry.entity'

export enum FeedItemEventType {
  HealthActivity = 'health_activity',
  NewFollower = 'new_follower',
  UserGoal = 'user_goal',
  WonLeague = 'won_league',
  JoinedLeague = 'joined_league',
  GoalHit = 'goal_hit',
  LifestyleActivity = 'lifestyle_activity',
  RewardClaimed = 'reward_claimed'
}

export enum FeedItemGroupType {
  UserActivity = 'user_activity',
  UserGoal = 'user_goal'
}

@Entity()
export class FeedItem extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.feed_items)
  user: User

  @Column({
    type: 'enum',
    enum: FeedItemEventType
  })
  event: FeedItemEventType

  @Column({
    type: 'enum',
    enum: FeedItemGroupType
  })
  group: FeedItemGroupType

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  related_user: User

  @OneToOne(() => HealthActivity, { nullable: true })
  @JoinColumn()
  related_health_activity: HealthActivity

  @OneToOne(() => GoalsEntry, { nullable: true })
  @JoinColumn()
  related_goals_entry: GoalsEntry
}
