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
import { RefreshToken } from '../../auth/entities/auth.entity'

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

  /** Don't allow this column to be read automatically in future */
  @Column()
  password: string

  // JoinTable / Cascade is on League entity
  @ManyToMany(() => League, (league) => league.users)
  leagues: League[]

  @OneToMany(() => Provider, (provider) => provider.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  providers: Provider[]

  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  refresh_tokens: RefreshToken[]

  @Column({
    type: 'enum',
    enum: UnitSystem,
    default: UnitSystem.Metric
  })
  unit_system: UnitSystem

  @Column({
    default: false
  })
  onboarded: boolean

  @Column({
    nullable: true
  })
  last_onboarded_at: Date

  @Column({
    default: 'Etc/UTC'
  })
  timezone: string

  // JoinTable/Cascade is on Team entity
  @ManyToMany(() => Team, (team) => team.users)
  teams: Team[]

  @Column({
    nullable: true
  })
  last_login_at: Date

  @Column({
    nullable: true
  })
  last_app_opened_at: Date

  @Column({
    nullable: true
  })
  last_health_activity_at: Date

  @Column({
    nullable: true
  })
  last_lifestyle_activity_at: Date

  @OneToOne(() => Image, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  avatar: Image

  @OneToOne(() => UsersSetting, (setting) => setting.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  settings: UsersSetting

  @OneToMany(() => RewardsRedemption, (redemption) => redemption.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  rewards_redemptions: RewardsRedemption[]

  @OneToMany(() => Following, (following) => following.follower, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  followers: Following[]

  @OneToMany(() => Following, (following) => following.following, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  following: Following[]

  @OneToMany(() => GoalsEntry, (goalsEntry) => goalsEntry.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  goals_entries: GoalsEntry[]

  @OneToMany(() => HealthActivity, (HealthActivity) => HealthActivity.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  health_activities: HealthActivity[]

  @OneToMany(() => FeedItem, (feedItem) => feedItem.user, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  feed_items: FeedItem[]

  @Column()
  name: string

  @Column({
    unique: true
  })
  email: string

  @Column({
    default: UserRank.Newbie
  })
  rank: UserRank

  @Column({
    default: 0
  })
  points_total: number

  @Column({
    default: 0
  })
  points_week: number

  @Column({
    default: 0
  })
  goal_calories: number

  @Column({
    default: 0
  })
  goal_steps: number

  @Column({
    default: 0
  })
  goal_floors_climbed: number

  @Column({
    type: 'float',
    default: 0
  })
  goal_water_litres: number

  @Column({
    type: 'float',
    default: 0
  })
  goal_sleep_hours: number
}
