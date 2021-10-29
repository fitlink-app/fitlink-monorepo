import { PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User, UserPublic } from '../../users/entities/user.entity'
import { FeedItem } from './feed-item.entity'

@Entity()
export class FeedItemLike extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn()
  user: User | UserPublic

  @ManyToOne(() => FeedItem, (feedItem) => feedItem.likes)
  feed_item: FeedItem
}
