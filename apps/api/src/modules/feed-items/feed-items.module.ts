import { Module } from '@nestjs/common'
import { FeedItemsService } from './feed-items.service'
import { FeedItemsController } from './feed-items.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeedItem } from './entities/feed-item.entity'
import { FeedItemLike } from './entities/feed-item-like.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FeedItem, FeedItemLike])],
  controllers: [FeedItemsController],
  providers: [FeedItemsService],
  exports: [FeedItemsService]
})
export class FeedItemsModule {}
