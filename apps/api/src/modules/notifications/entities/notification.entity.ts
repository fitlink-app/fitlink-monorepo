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
import { Image } from '../../images/entities/image.entity'
import { NotificationAction } from '../notifications.constants'

@Entity()
export class Notification extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user.notifications)
  user: User

  @OneToOne(() => Image, {
    createForeignKeyConstraints: false,
    nullable: true
  })
  avatar?: Image

  @Column({
    type: 'varchar'
  })
  action: NotificationAction

  @Column()
  title: string

  @Column()
  subject: string

  @Column({
    nullable: true
  })
  subject_id?: string

  /**
   * Meta key and value used in places where additional information
   * is required, e.g. for a league invitation, the meta_key
   * would be `inviter` and meta_value `John Doe`.
   */
  @Column({
    nullable: true
  })
  meta_key?: string

  @Column({
    nullable: true
  })
  meta_value?: string

  @Column({
    default: false
  })
  seen: boolean

  @Column({
    nullable: true
  })
  push_succeeded: boolean
}

/*

Notification {
 id: string
 avatar: Image
 title: string
 body: string
 seen: boolean
 action: "league_invite" | "started_following" | "message"
 subjectId: string
 subject: string
 date: string
}

avatar - a relevant avatar if any (for example picture of the league I'm invited to, or rather the avatar of the inviter
title - title of the notification or name of the inviter
seen - whether the notification has been seen by the user
action - type of the action eg.: "league_invite", "started_following"
userId/leagueId - id of the relevant entity, in case we need to navigate the user by clicking on the notification
subject - name of the league im invited to, or the person who added me
date - date of the notification


*/
