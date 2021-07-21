import { firestore } from 'firebase-admin'
import { LegacyHealthProvider } from './healthActivity'
import { LeagueInvitation, UserLeague } from './league'
import { TeamInvitationWithId } from './team'
import { FeedItemWithId } from './feed'

export type UnitSystem = 'metric' | 'imperial'
export type LeagueTitle = string

/** User model with UID attached */
export interface UserWithId extends LegacyUserDocument {
  id: string
}

export enum UserPrivacySettingsValue {
  Private = 'private',
  Followers = 'followers',
  Public = 'public'
}

export type UserPrivacySettings = {
  daily_statistics: UserPrivacySettingsValue
  activities: UserPrivacySettingsValue
}

export interface UserListPaginated {
  users: LegacyUserDocument[]
  last?: string
}

export type RedeemedReward = {
  redeemed_at: string
}

type Goal = { target: number; current: number }

export type Goals = {
  steps: Goal
  floors_climbed: Goal
  water_litres: Goal
  sleep_hours: Goal
  mindfulness: Goal
}

export type GoalsDTO = {
  steps: number
  floors_climbed: number
  water_litres: number
  sleep_hours: number
  mindfulness: number
  date?: Date
}

export type UserTeam = {
  id: string
  name: string
}

export interface UserTeamInvitation extends TeamInvitationWithId {
  seen: boolean
}

export interface LegacyUserDocument {
  id?: string
  onboarded: boolean
  needs_re_onboarding?: boolean
  needs_legacy_password_reset?: boolean
  legacy_id?: string
  legacy_email?: string
  newsletter_subscriptions: {
    user: false
    admin: false
  }
  newsletter_modal_prompted?: boolean
  privacy_settings: UserPrivacySettings
  keywords: string[]
  timezone: string
  name: string
  unit_system: UnitSystem
  photo_url: string | null
  photo_url_128x128: string | null
  photo_url_512x512: string | null
  teamIds: string[]
  teams: { [teamId: string]: UserTeam }
  updated_at: firestore.Timestamp
  last_login_at?: firestore.Timestamp
  last_app_opened_at?: firestore.Timestamp
  last_health_activity_at?: firestore.Timestamp
  last_lifestyle_activity_at?: firestore.Timestamp
  fcmTokens?: string[] | firestore.FieldValue
  daily_goals: Goals
  rank: string
  points_week: number
  points_total: number
  leagueIds: string[]
  leagues: { [leagueId: string]: UserLeague }
  followers: string[]
  following: string[]
  blocked: string[]
  league_invitations: { [leagueInvitationId: string]: LeagueInvitation }
  team_invitations?: { [teamId: string]: UserTeamInvitation }
  providers: { [providerId: string]: LegacyHealthProvider }
  rewards_redeemed: { [redeemedRewardId: string]: RedeemedReward }
  recent_feed?: { [feedItemId: string]: FeedItemWithId }
}

export interface UserUpdate extends Omit<User, 'leagueIds' | 'teamIds'> {
  leagueIds: firestore.FieldValue
  teamIds: firestore.FieldValue
}

export interface UserClaims {
  superAdmin?: boolean
  /**
   * The team id
   */
  admin?: string
}
