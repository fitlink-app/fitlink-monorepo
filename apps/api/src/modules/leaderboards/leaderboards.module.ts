import { Module } from '@nestjs/common'
import { LeaderboardsService } from './leaderboards.service'
import { LeaderboardsController } from './leaderboards.controller'

@Module({
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService]
})
export class LeaderboardsModule {}
