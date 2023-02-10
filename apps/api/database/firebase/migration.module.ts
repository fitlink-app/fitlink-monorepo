import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'

// Entities
import { FirebaseMigration } from '../../src/modules/firebase/entities/firebase.entity'

import { Activity } from '../../src/modules/activities/entities/activity.entity'
import { AuthProvider } from '../../src/modules/auth/entities/auth-provider.entity'
import { FeedItem } from '../../src/modules/feed-items/entities/feed-item.entity'
import { FeedItemLike } from '../../src/modules/feed-items/entities/feed-item-like.entity'
import { Following } from '../../src/modules/followings/entities/following.entity'
import { GoalsEntry } from '../../src/modules/goals-entries/entities/goals-entry.entity'
import { HealthActivity } from '../../src/modules/health-activities/entities/health-activity.entity'
import { HealthActivityDebug } from '../../src/modules/health-activities/entities/health-activity-debug.entity'
import { Image } from '../../src/modules/images/entities/image.entity'
import { Leaderboard } from '../../src/modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from '../../src/modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesInvitation } from '../../src/modules/leagues-invitations/entities/leagues-invitation.entity'
import { League } from '../../src/modules/leagues/entities/league.entity'
import { Notification } from '../../src/modules/notifications/entities/notification.entity'
import { Organisation } from '../../src/modules/organisations/entities/organisation.entity'
import { OrganisationsInvitation } from '../../src/modules/organisations-invitations/entities/organisations-invitation.entity'
import { Page } from '../../src/modules/pages/entities/page.entity'
import { Provider } from '../../src/modules/providers/entities/provider.entity'
import { Queueable } from '../../src/modules/queue/entities/queueable.entity'
import { RefreshToken } from '../../src/modules/auth/entities/auth.entity'
import { Reward } from '../../src/modules/rewards/entities/reward.entity'
import { RewardsRedemption } from '../../src/modules/rewards-redemptions/entities/rewards-redemption.entity'
import { Sport } from '../../src/modules/sports/entities/sport.entity'
import { Subscription } from '../../src/modules/subscriptions/entities/subscription.entity'
import { SubscriptionsInvitation } from '../../src/modules/subscriptions/entities/subscriptions-invitation.entity'
import { Team } from '../../src/modules/teams/entities/team.entity'
import { TeamsInvitation } from '../../src/modules/teams-invitations/entities/teams-invitation.entity'
import { User } from '../../src/modules/users/entities/user.entity'
import { UserRole } from '../../src/modules/user-roles/entities/user-role.entity'
import { UsersSetting } from '../../src/modules/users-settings/entities/users-setting.entity'

// Modules
import { AuthModule } from '../../src/modules/auth/auth.module'
import { ActivitiesModule } from '../../src/modules/activities/activities.module'
import { CommonModule } from '../../src/modules/common/common.module'
import { FeedItemsModule } from '../../src/modules/feed-items/feed-items.module'
import { FollowingsModule } from '../../src/modules/followings/followings.module'
import { GoalsEntriesModule } from '../../src/modules/goals-entries/goals-entries.module'
import { HealthActivitiesModule } from '../../src/modules/health-activities/health-activities.module'
import { ImagesModule } from '../../src/modules/images/images.module'
import { LeaderboardsModule } from '../../src/modules/leaderboards/leaderboards.module'
import { LeaderboardEntriesModule } from '../../src/modules/leaderboard-entries/leaderboard-entries.module'
import { LeaguesInvitationModule } from '../../src/modules/leagues-invitations/leagues-invitations.module'
import { LeaguesModule } from '../../src/modules/leagues/leagues.module'
import { OrganisationsModule } from '../../src/modules/organisations/organisations.module'
import { OrganisationsInvitationsModule } from '../../src/modules/organisations-invitations/organisations-invitations.module'
import { ProvidersModule } from '../../src/modules/providers/providers.module'
import { QueueModule } from '../../src/modules/queue/queue.module'
import { RewardsModule } from '../../src/modules/rewards/rewards.module'
import { RewardsRedemptionsModule } from '../../src/modules/rewards-redemptions/rewards-redemptions.module'
import { SportsModule } from '../../src/modules/sports/sports.module'
import { SubscriptionsModule } from '../../src/modules/subscriptions/subscriptions.module'
import { TeamsInvitationsModule } from '../../src/modules/teams-invitations/teams-invitations.module'
import { TeamsModule } from '../../src/modules/teams/teams.module'
import { UsersModule } from '../../src/modules/users/users.module'
import { UsersSettingsModule } from '../../src/modules/users-settings/users-settings.module'
import { UserRolesModule } from '../../src/modules/user-roles/user-roles.module'
import { UsersInvitationsModule } from '../../src/modules/users-invitations/users-invitations.module'
import { NotificationsModule } from '../../src/modules/notifications/notifications.module'
import { LeagueBfitClaim } from '../../src/modules/leagues/entities/bfit-claim.entity'
import { LeagueBfitEarnings } from '../../src/modules/leagues/entities/bfit-earnings.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env']
    }),

    EventEmitterModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          name: 'firebase_migration',
          type: 'postgres',
          database: configService.get('DB_DATABASE_NAME'),
          password: configService.get('DB_PASSWORD'),
          username: configService.get('DB_USERNAME'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          dropSchema: false,
          entities: [
            FirebaseMigration,
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
            Notification,
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
            LeagueBfitClaim,
            LeagueBfitEarnings
          ],
          synchronize: false,
          logging: false,
          retryAttempts: 1
        }
      }
    }),
    AuthModule,
    ActivitiesModule,
    CommonModule,
    FeedItemsModule,
    FollowingsModule,
    NotificationsModule,
    ImagesModule,
    LeaderboardsModule,
    LeaderboardEntriesModule,
    LeaguesModule,
    LeaguesInvitationModule,
    OrganisationsModule,
    OrganisationsInvitationsModule,
    ProvidersModule,
    QueueModule,
    RewardsModule,
    RewardsRedemptionsModule,
    SportsModule,
    TeamsModule,
    TeamsInvitationsModule,
    UsersModule,
    UsersSettingsModule,
    GoalsEntriesModule,
    HealthActivitiesModule,
    UserRolesModule,
    SubscriptionsModule,
    UsersInvitationsModule
  ]
})
export class MigrationModule {}
