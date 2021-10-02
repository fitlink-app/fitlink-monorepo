import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn
} from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'
import { ApiProperty } from '@nestjs/swagger'
import { LeaguesInvitation } from '../../leagues-invitations/entities/leagues-invitation.entity'
import { FeedItem } from '../../feed-items/entities/feed-item.entity'

@Entity()
export class Notification extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.notifications)
  user: User

  @OneToOne(() => LeaguesInvitation, (invitation) => invitation.notification, {
    nullable: true
  })
  @JoinColumn()
  league_invitation?: LeaguesInvitation

  @OneToOne(() => FeedItem, (feedItem) => feedItem.notification, {
    nullable: true
  })
  @JoinColumn()
  feed_item?: FeedItem

  @Column({
    nullable: true
  })
  link?: string

  @Column()
  subject: string

  @Column()
  message: string

  @Column()
  seen: boolean
}
