import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { tryAndCatch } from '../../../../src/helpers/tryAndCatch'
import { Repository } from 'typeorm'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { User } from '../entities/user.entity'
import { NewFollowerEvent } from '../events/new-follower.event'
import { Events } from '../../../../src/events'
import { Notification } from '../../notifications/entities/notification.entity'
import { FeedItem } from '../../feed-items/entities/feed-item.entity'
import { NotificationsService } from '../../notifications/notifications.service'
import { NotificationAction } from '../../notifications/notifications.constants'

@Injectable()
export class NewFollowerListener {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private feedItemsService: FeedItemsService,
    private notificationsService: NotificationsService
  ) {}
  @OnEvent(Events.USER_NEW_FOLLOWER)
  async onNewFollower(payload: NewFollowerEvent) {
    const user = await this.userRepository.findOne({ id: payload.userId })
    const targetUser = await this.userRepository.findOne(
      {
        id: payload.targetId
      },
      {
        relations: ['avatar']
      }
    )

    try {
      // Create feed item
      await this.feedItemsService.create({
        user,
        related_user: targetUser,
        type: FeedItemType.NewFollower,
        category: FeedItemCategory.MyUpdates
      })

      // Send push notification
      await this.notificationsService.create({
        avatar: targetUser.avatar,
        action: NotificationAction.NewFollower,
        subject: targetUser.name,
        subject_id: targetUser.id,
        user
      })
    } catch (e) {
      console.error(e)
    }
  }
}
