import { CreatableEntity } from '../../../classes/entity/creatable'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
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
import { Subscription } from '../../subscriptions/entities/subscription.entity'
import { UserRole } from '../../user-roles/entities/user-role.entity'
import { OrganisationsInvitation } from '../../organisations-invitations/entities/organisations-invitation.entity'
import { TeamsInvitation } from '../../teams-invitations/entities/teams-invitation.entity'
import { Activity } from '../../activities/entities/activity.entity'
import { AuthProvider } from '../../auth/entities/auth-provider.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

export enum UnitSystem {
  Metric = 'metric',
  Imperial = 'imperial'
}

export enum UserRank {
  Newbie = 'Fitlink Newbie'
}

@Entity()
export class User extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Don't allow this column to be read automatically in future */
  @Column()
  @Exclude()
  password: string

  @OneToMany(() => AuthProvider, (provider) => provider.user)
  auth_providers: AuthProvider[]

  // JoinTable / Cascade is on League entity
  @ManyToMany(() => League, (league) => league.users)
  leagues: League[]

  @OneToMany(() => Provider, (provider) => provider.user)
  owned_leagues: League[]

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

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: UnitSystem,
    default: UnitSystem.Metric
  })
  unit_system: UnitSystem

  @ApiProperty()
  @Column({
    default: false
  })
  onboarded: boolean

  @ApiProperty()
  @Column({
    nullable: true
  })
  last_onboarded_at: Date

  @ApiProperty()
  @Column({
    default: 'Etc/UTC'
  })
  timezone: string

  // JoinTable/Cascade is on Team entity
  @ManyToMany(() => Team, (team) => team.users)
  teams: Team[]

  @ApiProperty()
  @Column({
    nullable: true
  })
  last_login_at: Date

  @ApiProperty()
  @Column({
    nullable: true
  })
  last_app_opened_at: Date

  @ApiProperty()
  @Column({
    nullable: true
  })
  last_health_activity_at: Date

  @ApiProperty()
  @Column({
    nullable: true
  })
  last_lifestyle_activity_at: Date

  @Column({
    nullable: true
  })
  password_reset_at: Date

  @Column({
    nullable: true
  })
  email_reset_at: Date

  @Column({
    nullable: true
  })
  email_reset_requested_at: Date

  @ApiProperty({ type: Image })
  @OneToOne(() => Image, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  avatar: Image

  @ApiProperty({
    type: UsersSetting
  })
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
  @JoinColumn()
  followers: Following[]

  @OneToMany(() => Following, (following) => following.following, {
    cascade: ['remove'],
    onDelete: 'CASCADE'
  })
  @JoinColumn()
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

  /** Feed items for the user */
  @OneToMany(() => FeedItem, (feedItem) => feedItem.user)
  feed_items: FeedItem[]

  /** Feed items for other users */
  @OneToMany(() => FeedItem, (feedItem) => feedItem.related_user)
  related_feed_items: FeedItem[]

  @ManyToOne(() => Subscription, (subscription) => subscription.users)
  subscription: Subscription

  @OneToMany(() => UserRole, (role) => role.user)
  roles: UserRole[]

  @OneToMany(
    () => OrganisationsInvitation,
    (invitation) => invitation.resolved_user
  )
  organisations_invitations: OrganisationsInvitation[]

  @OneToMany(() => TeamsInvitation, (invitation) => invitation.resolved_user)
  teams_invitations: TeamsInvitation[]

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[]

  @OneToMany(() => Image, (image) => image.owner)
  image_uploads: Image[]

  @ApiProperty()
  @Column({
    nullable: true
  })
  name: string

  @ApiProperty()
  @Column({
    unique: true
  })
  email: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  email_pending: string

  @ApiProperty()
  @Column({
    default: false
  })
  email_verified: boolean

  @ApiProperty()
  @Column({
    default: UserRank.Newbie
  })
  rank: UserRank

  @ApiProperty()
  @Column({
    default: 0
  })
  points_total: number

  @ApiProperty()
  @Column({
    default: 0
  })
  points_week: number

  @ApiProperty()
  @Column({
    default: 0
  })
  goal_mindfulness_minutes: number

  @ApiProperty()
  @Column({
    default: 0
  })
  goal_steps: number

  @ApiProperty()
  @Column({
    default: 0
  })
  goal_floors_climbed: number

  @ApiProperty()
  @Column({
    type: 'float',
    default: 0
  })
  goal_water_litres: number

  @ApiProperty()
  @Column({
    type: 'float',
    default: 0
  })
  goal_sleep_hours: number

  @ApiProperty()
  @Column({
    default: 0
  })
  followers_total: number

  @ApiProperty()
  @Column({
    default: 0
  })
  following_total: number

  @Column('json', {
    nullable: true
  })
  fcm_tokens: string[]
}

export class UserPublic {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  name: string

  @ApiProperty()
  @Expose()
  avatar: Image

  @ApiProperty()
  @Expose()
  points_total: number

  @ApiProperty()
  @Expose()
  followers_total: number

  @ApiProperty()
  @Expose()
  following_total: number

  @ApiProperty()
  @Expose()
  /** Whether the entity user is a follower of the authenticated user */
  follower?: boolean

  @ApiProperty()
  @Expose()
  /** Whether the authenticated user is following the entity user */
  following?: boolean
}

export class UserPublicPagination {
  @ApiProperty()
  page_total: number

  @ApiProperty()
  total: number

  @ApiProperty({
    type: UserPublic,
    isArray: true
  })
  results: UserPublic[]
}
