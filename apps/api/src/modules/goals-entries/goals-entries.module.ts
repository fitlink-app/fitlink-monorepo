import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { GoalsEntriesController } from './goals-entries.controller'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoalsEntry } from './entities/goals-entry.entity'
import { UsersModule } from '../users/users.module'
import { FeedItemsModule } from '../feed-items/feed-items.module'
import { User } from '../users/entities/user.entity'
import { DailyGoalReachedListener } from './listeners/DailyGoalsReachedListener'
import { CommonModule } from '../common/common.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { League } from '../leagues/entities/league.entity'
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesService } from '../leagues/leagues.service'
import { LeaguesModule } from '../leagues/leagues.module'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { LeagueBfitClaim } from '../leagues/entities/bfit-claim.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { LeaguesInvitation } from '../leagues-invitations/entities/leagues-invitation.entity'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GoalsEntry,
      User,
      League,
      LeagueBfitEarnings,
      WalletTransaction,
      LeaderboardEntry,
      Leaderboard,
      LeagueBfitClaim,
      Organisation,
      LeaguesInvitation
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FeedItemsModule),
    ConfigModule,
    HttpModule,
    CommonModule,
    NotificationsModule
  ],
  controllers: [GoalsEntriesController],
  providers: [
    GoalsEntriesService,
    LeaguesService,
    LeaderboardEntriesService,
    DailyGoalReachedListener
  ],
  exports: [TypeOrmModule.forFeature([GoalsEntry]), GoalsEntriesService]
})
export class GoalsEntriesModule {}
