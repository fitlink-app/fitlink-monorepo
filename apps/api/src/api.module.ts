import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

// Entities
import { Activity } from './modules/activities/entities/activity.entity'
import { FeedItem } from './modules/feed-items/entities/feed-item.entity'
import { Following } from './modules/followings/entities/following.entity'
import { GoalsEntry } from './modules/goals-entries/entities/goals-entry.entity'
import { HealthActivity } from './modules/health-activities/entities/health-activity.entity'
import { Image } from './modules/images/entities/image.entity'
import { Leaderboard } from './modules/leaderboards/entities/leaderboard.entity'
import { LeaderboardEntry } from './modules/leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesInvitation } from './modules/leagues-invitations/entities/leagues-invitation.entity'
import { League } from './modules/leagues/entities/league.entity'
import { Organisation } from './modules/organisations/entities/organisation.entity'
import { OrganisationsInvitation } from './modules/organisations-invitations/entities/organisations-invitation.entity'
import { Provider } from './modules/providers/entities/provider.entity'
import { RefreshToken } from './modules/auth/entities/auth.entity'
import { Reward } from './modules/rewards/entities/reward.entity'
import { RewardsRedemption } from './modules/rewards-redemptions/entities/rewards-redemption.entity'
import { Sport } from './modules/sports/entities/sport.entity'
import { Subscription } from './modules/subscriptions/entities/subscription.entity'
import { Team } from './modules/teams/entities/team.entity'
import { TeamsInvitation } from './modules/teams-invitations/entities/teams-invitation.entity'
import { User } from './modules/users/entities/user.entity'
import { UserRole } from './modules/user-roles/entities/user-role.entity'
import { UsersSetting } from './modules/users-settings/entities/users-setting.entity'

// Modules
import { AuthModule } from './modules/auth/auth.module'
import { ActivitiesModule } from './modules/activities/activities.module'
import { FollowingsModule } from './modules/followings/followings.module'
import { ImagesModule } from './modules/images/images.module'
import { LeaderboardsModule } from './modules/leaderboards/leaderboards.module'
import { LeaderboardEntriesModule } from './modules/leaderboard-entries/leaderboard-entries.module'
import { LeaguesInvitationsModule } from './modules/leagues-invitations/leagues-invitations.module'
import { LeaguesModule } from './modules/leagues/leagues.module'
import { OrganisationsModule } from './modules/organisations/organisations.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { RewardsModule } from './modules/rewards/rewards.module'
import { RewardsRedemptionsModule } from './modules/rewards-redemptions/rewards-redemptions.module'
import { SportsModule } from './modules/sports/sports.module'
import { TeamsInvitationsModule } from './modules/teams-invitations/teams-invitations.module'
import { TeamsModule } from './modules/teams/teams.module'
import { UsersModule } from './modules/users/users.module'
import { UsersSettingsModule } from './modules/users-settings/users-settings.module'
import { GoalsEntriesModule } from './modules/goals-entries/goals-entries.module'
import { HealthActivitiesModule } from './modules/health-activities/health-activities.module'
import { FeedItemsModule } from './modules/feed-items/feed-items.module'
import { UploadGuard } from './guards/upload.guard'
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module'
import { UserRolesModule } from './modules/user-roles/user-roles.module'
import { CommonModule } from './modules/common/common.module'
import { OrganisationsInvitationsModule } from './modules/organisations-invitations/organisations-invitations.module'
import { UsersInvitationsModule } from './modules/users-invitations/users-invitations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env']
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          database: configService.get('DB_DATABASE_NAME'),
          password: configService.get('DB_PASSWORD'),
          username: configService.get('DB_USERNAME'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          dropSchema: false,
          entities: [
            Activity,
            Following,
            FeedItem,
            HealthActivity,
            GoalsEntry,
            Image,
            Leaderboard,
            LeaderboardEntry,
            League,
            LeaguesInvitation,
            Organisation,
            OrganisationsInvitation,
            Provider,
            RefreshToken,
            Reward,
            RewardsRedemption,
            Sport,
            Subscription,
            Team,
            TeamsInvitation,
            User,
            UserRole,
            UsersSetting
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
    ImagesModule,
    LeaderboardsModule,
    LeaderboardEntriesModule,
    LeaguesModule,
    LeaguesInvitationsModule,
    OrganisationsModule,
    OrganisationsInvitationsModule,
    ProvidersModule,
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UploadGuard
    }
  ]
})
export class ApiModule {}
