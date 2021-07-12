import { firestore } from 'firebase-admin'

export enum LeagueAccessScope {
  Team = 'team',
  Public = 'public',
  Private = 'private',
  Organisation = 'organisation'
}

export interface CreateLeagueDTO {
  title: string
  sport: string
  description: string
  access: LeagueAccessScope

  /**
   * Duration in days
   */
  duration: number
  repeat: boolean
  team_id: string
  image?: any
}

export interface LegacyLeague {
  id?: string
  photo_url: string
  photo_url_1200x600: string
  title: string
  keywords?: string[]
  sport: string
  description: string
  duration: number
  ends_at: firestore.Timestamp
  members_count: number
  repeat: boolean
  invited_users: string[]
  access: LeagueAccessScope
  team_id?: string
  team?: LeagueTeam
  created_by: string
  active_leaderboard: string
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
  user?: LegacyLeagueUser
  leaderboard_entry?: LegacyLeaderboardEntry
}

export interface LeagueWithId extends LegacyLeague {
  id: string
}

export interface LeagueUpdate
  extends Omit<LegacyLeague, 'members_count' | 'invited_users'> {
  members_count: firestore.FieldValue
  invited_users: firestore.FieldValue
}

export interface LeagueInvite {
  league_id: string
  to_user: string
  from_user: string
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
}

export type LeagueInvitation = {
  accepted: boolean
  dismissed: boolean
  league_id: string
  from_user: string
  from_name: string
  from_photo: string
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
}

export interface LeagueTeam {
  team_id: string
  company: string
  photo_url_128x128: string
}

export type UserLeague = {
  id: string
  title: string
  sport: string
}

export interface LegacyLeagueUser {
  league_id: string
  uid: string
  name: string
  photo_url_128x128: string
  wins: number
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
}

export interface LeagueUserUpdate extends Omit<LegacyLeagueUser, 'wins'> {
  wins: firestore.FieldValue
}

export interface LegacyLeaderboard {
  id: string
  league_id: string
  completed: boolean
  winners: string[]
  update_task?: string
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
  history_points: HistoryPoints
}

export type HistoryPoints = {
  today_points: number
  week_points: number
  month_points: number
  year_points: number
  last_week_points: number
  last_month_points: number
  last_year_points: number
}

export interface LeaderboardPointsUpdate
  extends Omit<LegacyLeaderboard, 'history_points'> {
  history_points: Partial<HistoryPointsUpdate>
}

export type HistoryPointsUpdate = {
  today_points: firestore.FieldValue | number
  week_points: firestore.FieldValue | number
  month_points: firestore.FieldValue | number
  year_points: firestore.FieldValue | number
  last_week_points: firestore.FieldValue | number
  last_month_points: firestore.FieldValue | number
  last_year_points: firestore.FieldValue | number
}
export interface LeaderboardUpdate extends Omit<LegacyLeaderboard, 'winners'> {
  winners: firestore.FieldValue
}

export interface LegacyLeaderboardEntry {
  index: number
  user_id: string
  league_id: string
  leaderboard_id: string
  wins: number
  points: number
  pending_points: number
  position: number
  created_at: firestore.Timestamp
  updated_at: firestore.Timestamp
}

export interface LegacyLeaderboardEntryUpdate
  extends Omit<LegacyLeaderboardEntry, 'wins' | 'points' | 'pending_points'> {
  wins: firestore.FieldValue
  points: firestore.FieldValue
  pending_points: firestore.FieldValue
}

export interface LeagueWithId extends LegacyLeague {
  id: string
}

export interface LeagueWithLeagueUsers extends LegacyLeague {
  user: LegacyLeagueUser
}

export interface LeagueWithIdAndLeagueUsers extends LeagueWithId {
  user: LegacyLeagueUser
}

export interface LegacyLeaderboardEntryWithLeagueUser {
  user: LegacyLeagueUser
  leaderboard_entry: LegacyLeaderboardEntry
}

export interface LeagueWithLegacyLeaderboardEntry extends LegacyLeague {
  leaderboard_entry: LegacyLeaderboardEntry
}
