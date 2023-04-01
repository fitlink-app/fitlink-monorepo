import { createConnection } from 'typeorm'
import { runSeeder, useSeeding } from 'typeorm-seeding'
import CreateSports from '../database/seeds/sport.seed'
import migrations from './migrations'

// Entities
import { Activity } from './modules/activities/entities/activity.entity'
import { AuthProvider } from './modules/auth/entities/auth-provider.entity'
import { FeedItem } from './modules/feed-items/entities/feed-item.entity'
import { FeedItemLike } from './modules/feed-items/entities/feed-item-like.entity'
import { Following } from './modules/followings/entities/following.entity'
import { GoalsEntry } from './modules/goals-entries/entities/goals-entry.entity'
import { HealthActivity } from './modules/health-activities/entities/health-activity.entity'
import { HealthActivityDebug } from './modules/health-activities/entities/health-activity-debug.entity'
import { Image } from './modules/images/entities/image.entity'
import { Leaderboard } from './modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from './modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesInvitation } from './modules/leagues-invitations/entities/leagues-invitation.entity'
import { League } from './modules/leagues/entities/league.entity'
import { Organisation } from './modules/organisations/entities/organisation.entity'
import { OrganisationsInvitation } from './modules/organisations-invitations/entities/organisations-invitation.entity'
import { Page } from './modules/pages/entities/page.entity'
import { Provider } from './modules/providers/entities/provider.entity'
import { Queueable } from './modules/queue/entities/queueable.entity'
import { RefreshToken } from './modules/auth/entities/auth.entity'
import { Reward } from './modules/rewards/entities/reward.entity'
import { RewardsRedemption } from './modules/rewards-redemptions/entities/rewards-redemption.entity'
import { Sport } from './modules/sports/entities/sport.entity'
import { Subscription } from './modules/subscriptions/entities/subscription.entity'
import { SubscriptionsInvitation } from './modules/subscriptions/entities/subscriptions-invitation.entity'
import { Team } from './modules/teams/entities/team.entity'
import { TeamsInvitation } from './modules/teams-invitations/entities/teams-invitation.entity'
import { User } from './modules/users/entities/user.entity'
import { UserRole } from './modules/user-roles/entities/user-role.entity'
import { UsersSetting } from './modules/users-settings/entities/users-setting.entity'
import { Notification } from './modules/notifications/entities/notification.entity'
import { LeagueBfitClaim } from './modules/leagues/entities/bfit-claim.entity'
import { LeagueBfitEarnings } from './modules/leagues/entities/bfit-earnings.entity'
import { LeagueWaitlistUser } from './modules/leagues/entities/league-waitlist-user.entity'
import { Tenant } from './modules/tenant/tenant-service.decorator'
import { WalletTransaction } from './modules/wallet-transactions/entities/wallet-transaction.entity'

export async function migrate() {
  const connection = await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    synchronize: false,
    logging: true,
    dropSchema: false,
    migrations: migrations,
    entities: [
      Activity,
      AuthProvider,
      Following,
      FeedItem,
      FeedItemLike,
      HealthActivity,
      HealthActivityDebug,
      GoalsEntry,
      Image,
      Leaderboard,
      LeaderboardEntry,
      League,
      LeaguesInvitation,
      Organisation,
      OrganisationsInvitation,
      Page,
      Provider,
      Queueable,
      RefreshToken,
      Reward,
      RewardsRedemption,
      Sport,
      Subscription,
      SubscriptionsInvitation,
      Team,
      TeamsInvitation,
      User,
      UserRole,
      UsersSetting,
      Notification,
      LeagueBfitClaim,
      LeagueBfitEarnings,
      LeagueWaitlistUser,
      Tenant,
      WalletTransaction,
    ]
  })

  let results = []
  try {
    results.push(
      await connection.runMigrations({
        transaction: 'none'
      })
    )

    // Seed sports
    results.push(await runSeeder(CreateSports))
  } catch (e) {
    await connection.close()
    throw e
  }

  await connection.close()
  return results
}

migrate()
