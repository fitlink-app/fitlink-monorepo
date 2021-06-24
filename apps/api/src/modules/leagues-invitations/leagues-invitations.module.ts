import { Module } from '@nestjs/common'
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

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      LeaguesInvitation,
      League,
      Leaderboard,
      LeaderboardEntry,
      Team,
      Organisation,
      User
    ]),
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
