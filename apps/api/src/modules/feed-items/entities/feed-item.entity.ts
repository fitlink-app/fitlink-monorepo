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
import { Reward } from '../../rewards/entities/reward.entity'
import {
  FeedItemCategory,
  FeedItemType,
  FeedGoalType,
  UserTier
} from '../feed-items.constants'

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
  type: FeedItemType

  @Column({
    type: 'enum',
    enum: UserTier,
    nullable: true
  })
  tier?: UserTier

  @ManyToOne(() => HealthActivity, (activity) => activity.feed_items)
  @JoinColumn()
  health_activity?: HealthActivity

  @ManyToOne(() => League, (league) => league.feed_items)
  @JoinColumn()
  league?: League

  @ManyToOne(() => Reward, (reward) => reward.feed_items)
  @JoinColumn()
  reward?: Reward

  @ManyToOne(() => User, (user) => user.related_feed_items)
  @JoinColumn()
  related_user?: User

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
