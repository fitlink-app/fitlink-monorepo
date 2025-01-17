import { HttpModule, Module } from '@nestjs/common'
import { LeaguesInvitationsService } from './leagues-invitations.service'
import { LeaguesInvitationsController } from './leagues-invitations.controller'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeaguesInvitation } from './entities/leagues-invitation.entity'
import { JwtModule } from '@nestjs/jwt'
import { LeaguesService } from '../leagues/leagues.service'
import { League } from '../leagues/entities/league.entity'
import { Team } from '../teams/entities/team.entity'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { User } from '../users/entities/user.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'
import { CommonModule } from '../common/common.module'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import { NotificationsModule } from '../notifications/notifications.module'
import { LeagueBfitClaim } from '../leagues/entities/bfit-claim.entity'
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { LeagueWaitlistUser } from '../leagues/entities/league-waitlist-user.entity'

@Module({
  imports: [
    CommonModule,
    HttpModule,
    TypeOrmModule.forFeature([
      LeaguesInvitation,
      League,
      Leaderboard,
      LeaderboardEntry,
      Team,
      Organisation,
      User,
      HealthActivity,
      LeagueBfitClaim,
      LeagueBfitEarnings,
      WalletTransaction,
      LeagueWaitlistUser
    ]),
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('EMAIL_JWT_TOKEN_SECRET'),
          signOptions: { expiresIn: '30d' }
        }
      }
    })
  ],
  controllers: [LeaguesInvitationsController],
  providers: [
    LeaguesInvitationsService,
    LeaguesService,
    LeaderboardEntriesService,
    ConfigService
  ],
  exports: [
    TypeOrmModule.forFeature([LeaguesInvitation]),
    LeaguesInvitationsService
  ]
})
export class LeaguesInvitationModule {}
