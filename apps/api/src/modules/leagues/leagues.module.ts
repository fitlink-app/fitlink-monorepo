import { Module } from '@nestjs/common'
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      League,
      Leaderboard,
      LeaderboardEntry,
      Team,
      Organisation
    ]),
    AuthModule,
    LeaguesInvitationModule
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService, LeaderboardEntriesService],
  exports: []
})
export class LeaguesModule {}
