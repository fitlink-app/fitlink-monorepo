import { messaging } from 'firebase-admin'

//❌: not implemented yet.

export enum NotificationAction {
  /** 🎉 {meta_value} just invited you to join the league {subject}. Let's go! */
  LeagueInvitation = 'league_invitation',

  /** 🎉 Nailed it. You just hit your {subject} goal. Keep it up. */
  GoalAchieved = 'goal_achieved',

  /** 👋 {subject} followed you. Check it out. */
  NewFollower = 'new_follower',

  /** 👏 Winner! You just won the league {subject}. Check it out. */
  LeagueWon = 'league_won', //

  /** ⏱ Heads up, the league {subject} has just reset. Go for it. */
  LeagueReset = 'league_reset', //

  /** 📢 Remember, the league {subject} will end in 24 hours. You still have time. */
  LeagueEnding = 'league_ending', //

  /** 👍 Nice. You ranked up to {subject}. Keep it going. */
  RankUp = 'rank_up',

  /** 👎 Ouch! Your rank dropped to {subject}. You can do it. */
  RankDown = 'rank_down', //

  /** 👣 So close to reaching your steps goal. Get {meta_value} more steps in today by having a brisk walk. */
  GoalProgressSteps = 'goal_progress_steps', //

  /** ❤️ You've got love. {subject} just liked your {meta_value}. Check it out.	*/
  ActivityLiked = 'activity_liked',

  /** 🎁 You just unlocked a new reward {subject}. Check it out.	*/
  RewardUnlocked = 'reward_unlocked',

  /** 🚀 It's a new week, and you've got goals. Let's go! */
  MondayReminder = 'monday_reminder'
}

export type NotificationPayload = Omit<messaging.Message, 'token'>
