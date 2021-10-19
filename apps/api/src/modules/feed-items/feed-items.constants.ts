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

export enum FeedGoalType {
  Steps = 'steps',
  FloorsClimbed = 'floors_climbed',
  WaterLitres = 'water_litres',
  SleepHours = 'sleep_hours',
  MindfulnessMinutes = 'mindfulness_minutes'
}

export const FeedGoalTypeFormat = {
  [FeedGoalType.Steps]: 'Steps',
  [FeedGoalType.FloorsClimbed]: 'Stairs',
  [FeedGoalType.MindfulnessMinutes]: 'Mindfulness Minutes',
  [FeedGoalType.WaterLitres]: 'Hydration',
  [FeedGoalType.SleepHours]: 'Sleep'
}
