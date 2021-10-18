import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import { User } from '../entities/user.entity'
import { NewFollowerEvent } from '../events/new-follower.event'
import { Events } from '../../../../src/events'
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
    const userThatFollows = await this.userRepository.findOne(
      {
        id: payload.userId
      },
      {
        relations: ['avatar']
      }
    )
    const userThatIsFollowed = await this.userRepository.findOne({
      id: payload.targetId
    })

    try {
      // Create feed item
      await this.feedItemsService.create({
        user: userThatIsFollowed,
        related_user: userThatFollows,
        type: FeedItemType.NewFollower,
        category: FeedItemCategory.MyUpdates
      })

      // Send push notification
      await this.notificationsService.create({
        avatar: userThatFollows.avatar,
        action: NotificationAction.NewFollower,
        subject: userThatFollows.name,
        subject_id: userThatFollows.id,
        user: userThatIsFollowed
      })
    } catch (e) {
      console.error(e)
    }
  }
}
