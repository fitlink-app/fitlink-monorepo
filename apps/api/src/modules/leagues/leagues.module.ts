import { Module } from '@nestjs/common'
import { LeaguesService } from './leagues.service'
import { LeaguesController } from './leagues.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { League } from './entities/league.entity'
import { AuthModule } from '../auth/auth.module'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'

@Module({
  imports: [TypeOrmModule.forFeature([League, Leaderboard]), AuthModule],
  controllers: [LeaguesController],
  providers: [LeaguesService]
})
export class LeaguesModule {}
