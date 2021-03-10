import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { League } from '../../leagues/entities/league.entity'
import { Provider } from '../../providers/entities/provider.entity'
import { Team } from '../../teams/entities/team.entity'
import { Image } from '../../images/entities/image.entity'
import { UsersSetting } from '../../users-settings/entities/users-setting.entity'
import { RewardsRedemption } from '../../rewards-redemptions/entities/rewards-redemption.entity'
import { Following } from '../../followings/entities/following.entity'
import { GoalsEntry } from '../../goals-entries/entities/goals-entry.entity'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { FeedItem } from '../../feed-items/entities/feed-item.entity'

export enum UnitSystem {
  Metric = 'metric',
  Imperial = 'imperial'
}

export enum UserRank {
  Newbie = 'Fitlink Newbie'
}

@Entity()
export class User extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToMany(() => League, (league) => league.users)
  leagues: League[]

  @OneToMany(() => Provider, (provider) => provider.user)
  providers: Provider[]

  @Column({
    type: 'enum',
    enum: UnitSystem
  })
  unit_system: UnitSystem

  @Column()
  onboarded: boolean

  @Column()
  last_onboarded_at: Date

  @Column({
    default: 'Etc/UTC'
  })
  timezone: string

  @ManyToMany(() => Team, (team) => team.users)
  teams: Team[]

  @Column()
  last_login_at: Date

  @Column()
  last_app_opened_at: Date

  @Column()
  last_health_activity_at: Date

  @Column()
  last_lifestyle_activity_at: Date

  @OneToOne(() => Image)
  @JoinColumn()
  avatar: Image

  @OneToOne(() => UsersSetting, (setting) => setting.user)
  @JoinColumn()
  settings: UsersSetting

  @OneToMany(() => RewardsRedemption, (redemption) => redemption.user)
  rewards_redemptions: RewardsRedemption[]

  @OneToMany(() => Following, (following) => following.follower)
  followers: Following[]

  @OneToMany(() => Following, (following) => following.following)
  following: Following[]

  @OneToMany(() => GoalsEntry, (goalsEntry) => goalsEntry.user)
  goals_entries: GoalsEntry[]

  @OneToMany(() => HealthActivity, (HealthActivity) => HealthActivity.user)
  health_activities: HealthActivity[]

  @OneToMany(() => FeedItem, (feedItem) => feedItem.user)
  feed_items: FeedItem[]

  @Column({
    default: UserRank.Newbie
  })
  rank: UserRank

  @Column()
  points_total: number

  @Column()
  points_week: number

  @Column()
  goal_calories: number

  @Column()
  goal_steps: number

  @Column()
  goal_floors_climbed: number

  @Column({
    type: 'float'
  })
  goal_water_litres: number

  @Column({
    type: 'float'
  })
  goal_sleep_hours: number
}
