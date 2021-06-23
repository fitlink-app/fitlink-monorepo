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

@Module({
  imports: [
    TypeOrmModule.forFeature([League, Leaderboard, Team, Organisation]),
    AuthModule,
    LeaguesInvitationModule
  ],
  controllers: [LeaguesController],
  providers: [LeaguesService],
  exports: []
})
export class LeaguesModule {}
