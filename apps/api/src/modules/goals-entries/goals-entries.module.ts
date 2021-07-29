import { HttpModule, Module } from '@nestjs/common'
import { GoalsEntriesService } from './goals-entries.service'
import { GoalsEntriesController } from './goals-entries.controller'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GoalsEntry } from './entities/goals-entry.entity'
import { UsersModule } from '../users/users.module'
import { FeedItemsModule } from '../feed-items/feed-items.module'
import { User } from '../users/entities/user.entity'
import { DailyGoalReachedListener } from './listeners/DailyGoalsReachedListener'

@Module({
  imports: [
    TypeOrmModule.forFeature([GoalsEntry, User]),
    UsersModule,
    AuthModule,
    ConfigModule,
    HttpModule,
    FeedItemsModule
  ],
  controllers: [GoalsEntriesController],
  providers: [GoalsEntriesService, DailyGoalReachedListener],
  exports: [TypeOrmModule.forFeature([GoalsEntry]), GoalsEntriesService]
})
export class GoalsEntriesModule {}
