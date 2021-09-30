import { define } from 'typeorm-seeding'
import Faker from 'faker'
import { FeedItem } from '../../src/modules/feed-items/entities/feed-item.entity'
import {
  FeedItemCategory,
  FeedItemType
} from '../../src/modules/feed-items/feed-items.constants'

define(FeedItem, (faker: typeof Faker) => {
  const feedItem = new FeedItem()

  feedItem.category = FeedItemCategory.MyUpdates
  feedItem.type = FeedItemType.TierUp

  return feedItem
})
