import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  Column,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToOne
} from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User, UserPublic } from '../../users/entities/user.entity'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { GoalsEntry } from '../../goals-entries/entities/goals-entry.entity'
import { League } from '../../leagues/entities/league.entity'
import { Reward } from '../../rewards/entities/reward.entity'
import {
  FeedItemCategory,
  FeedItemType,
  FeedGoalType
} from '../feed-items.constants'
import { UserRank } from '../../users/users.constants'
import { Notification } from '../../notifications/entities/notification.entity'

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
    enum: UserRank,
    nullable: true
  })
  tier?: UserRank

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
  related_user?: User | UserPublic

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
  user: User | UserPublic

  @ManyToMany(() => User, (user) => user.likes)
  @JoinTable()
  @JoinColumn()
  likes: User[] | UserPublic[]

  @OneToOne(() => Notification, (notification) => notification.feed_item, {
    nullable: true
  })
  notification: Notification
}
