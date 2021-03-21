import { Module } from '@nestjs/common'
import { LeaderboardsService } from './leaderboards.service'
import { LeaderboardsController } from './leaderboards.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService]
})
export class LeaderboardsModule {}
