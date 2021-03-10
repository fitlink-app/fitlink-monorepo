import { Module } from '@nestjs/common'
import { FeedItemsService } from './feed-items.service'
import { FeedItemsController } from './feed-items.controller'

@Module({
  controllers: [FeedItemsController],
  providers: [FeedItemsService]
})
export class FeedItemsModule {}
