import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeaderboardEntriesModule } from './leaderboard-entries/leaderboard-entries.module'
import { LeaderboardEntry } from './leaderboard-entries/entities/leaderboard-entry.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'fitlink',
      password: 'fitlink',
      username: 'fitlink',
      host: 'localhost',
      dropSchema: false,
      entities: [LeaderboardEntry],
      synchronize: false,
      logging: false
    }),
    LeaderboardEntriesModule
  ]
})
export class ApiModule {}
