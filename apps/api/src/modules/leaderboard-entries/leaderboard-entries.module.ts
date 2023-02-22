import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeaderboardEntriesService } from './leaderboard-entries.service'
import { LeaderboardEntriesController } from './leaderboard-entries.controller'
import { LeaderboardEntry } from './entities/leaderboard-entry.entity'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { League } from '../leagues/entities/league.entity'

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    TypeOrmModule.forFeature([LeaderboardEntry, League])
  ],
  controllers: [LeaderboardEntriesController],
  providers: [LeaderboardEntriesService],
  exports: [
    TypeOrmModule.forFeature([LeaderboardEntry]),
    LeaderboardEntriesService
  ]
})
export class LeaderboardEntriesModule {}
