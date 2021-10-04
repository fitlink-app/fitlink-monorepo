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

@Injectable()
export class NewFollowerListener {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private feedItemsService: FeedItemsService
  ) {}
  @OnEvent(Events.USER_NEW_FOLLOWER)
  async onNewFollower(payload: NewFollowerEvent) {
    const user = await this.userRepository.findOne({ id: payload.userId })
    const targetUser = await this.userRepository.findOne({
      id: payload.targetId
    })

    const [_, error] = await tryAndCatch(
      this.feedItemsService.create({
        user,
        related_user: targetUser,
        type: FeedItemType.NewFollower,
        category: FeedItemCategory.MyUpdates
      })
    )
    error && console.error(error)
  }
}
