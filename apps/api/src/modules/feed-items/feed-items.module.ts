import { Module } from '@nestjs/common'
import { FeedItemsService } from './feed-items.service'
import { FeedItemsController } from './feed-items.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeedItem } from './entities/feed-item.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FeedItem])],
  controllers: [FeedItemsController],
  providers: [FeedItemsService],
  exports: [FeedItemsService]
})
export class FeedItemsModule {}
