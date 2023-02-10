import { HttpModule, HttpService, Module } from '@nestjs/common'
import { LeaguesService } from './leagues.service'
import { LeaguesController } from './leagues.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { League } from './entities/league.entity'
import { AuthModule } from '../auth/auth.module'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { Team } from '../teams/entities/team.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { LeaguesInvitationModule } from '../leagues-invitations/leagues-invitations.module'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import { HealthActivityCreatedListener } from './listeners/HealthActivityCreatedListener'
import { User } from '../users/entities/user.entity'
import { FeedItemsModule } from '../feed-items/feed-items.module'
import { CommonModule } from '../common/common.module'
import { LeagueJoinedListener } from './listeners/LeagueJoinedListener'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { LeagueWonListener } from './listeners/LeagueWonListener'
import { NotificationsModule } from '../notifications/notifications.module'
import { LeagueBfitClaim } from './entities/bfit-claim.entity'
import { LeagueBfitEarnings } from './entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      League,
      Leaderboard,
      LeaderboardEntry,
      Team,
      Organisation,
      HealthActivity,
      LeagueBfitClaim,
      User,
      LeagueBfitEarnings,
      WalletTransaction
    ]),
    CommonModule,
    AuthModule,
    LeaguesInvitationModule,
    FeedItemsModule,
    EventEmitter2,
    NotificationsModule,
    HttpModule
  ],
  controllers: [LeaguesController],
  providers: [
    LeaguesService,
    LeaderboardEntriesService,
    HealthActivityCreatedListener,
    LeagueJoinedListener,
    LeagueWonListener
  ],
  exports: []
})
export class LeaguesModule {}
