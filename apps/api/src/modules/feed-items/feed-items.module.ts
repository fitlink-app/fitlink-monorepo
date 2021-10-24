import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { FeedItemsService } from './feed-items.service'
import { FeedItemsController } from './feed-items.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeedItem } from './entities/feed-item.entity'
import { FeedItemLike } from './entities/feed-item-like.entity'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { ConfigModule } from '@nestjs/config'
import { NotificationsModule } from '../notifications/notifications.module'
import { CommonModule } from '../common/common.module'
import { GoalsEntriesModule } from '../goals-entries/goals-entries.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedItem, FeedItemLike]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => GoalsEntriesModule),
    NotificationsModule,
    CommonModule
  ],
  controllers: [FeedItemsController],
  providers: [FeedItemsService],
  exports: [FeedItemsService]
})
export class FeedItemsModule {}
