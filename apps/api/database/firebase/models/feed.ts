import { firestore } from 'firebase-admin'
import { HealthActivityWithId } from './healthActivity'
import { LeagueWithId } from './league'
import { LegacyRewardWithId } from './reward'

export enum LegacyFeedItemCategory {
  MyActivities = 'my_activities',
  MyGoals = 'my_goals',
  MyUpdates = 'my_updates',
  FriendsActivities = 'friends_activities'
}

export enum LegacyFeedItemType {
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

export enum LegacyUserTier {
  tier1 = 'Fitlink Newbie',
  tier2 = 'Fitlink Pro'
}

export type LegacyFeedUser = {
  uid: string
  photo_url_128x128: string | null
  name: string
}

export enum LegacyFeedGoalType {
  Steps = 'steps',
  FloorsClimbed = 'floors_climbed',
  WaterLitres = 'water_litres',
  SleepHours = 'sleep_hours',
  Mindfulness = 'mindfulness'
}

type LegacyFeedGoal = {
  type: LegacyFeedGoalType
  current: number
  target: number
}

/* ------------------------------------------ */
/* -------------   Feed Item    ------------- */
/* ------------------------------------------ */
export interface LegacyFeedItem {
  category: LegacyFeedItemCategory

  /** Whether its an activity or an event type entry */
  type: LegacyFeedItemType

  /**
   * Thumbnail for the feed entry.
   * e.g. for activities, this is the user's avatar.
   */
  thumbnail?: string | null

  health_activity?: HealthActivityWithId

  league?: LeagueWithId

  reward?: LegacyRewardWithId

  goal?: LegacyFeedGoal

  user: LegacyFeedUser

  tier?: LegacyUserTier

  /**
   * Date of the feed entry.
   * We can use this value for sorting and as a query cursor if needed.
   *
   * For events, this value equals to created_at,
   * For activities, this would be equal to the activity end_time.
   */
  date: firestore.Timestamp

  created_at: firestore.Timestamp

  updated_at: firestore.Timestamp
}

/* ------------------------------------------ */
/* -----------   Recent Feed Item ----------- */
/* ------------------------------------------ */
export interface LegacyFeedItemWithId extends LegacyFeedItem {
  /** Pointer to the actual feed entry */
  id: string
}

export interface FakeFeedItem extends LegacyFeedItem {
  fake: true
}
