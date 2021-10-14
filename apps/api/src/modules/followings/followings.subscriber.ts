import { Injectable } from '@nestjs/common'
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  Repository
} from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Following } from './entities/following.entity'

@Injectable()
@EventSubscriber()
export class FollowingsSubscriber
  implements EntitySubscriberInterface<Following> {
  constructor(connection: Connection) {
    connection.subscribers.push(this)
  }

  listenTo() {
    return Following
  }

  async afterInsert(event: InsertEvent<Following>) {
    await this.updateFollowerCount(event.entity.id, event, 'insert')
  }

  async afterRemove(event: RemoveEvent<Following>) {
    await this.updateFollowerCount(event.entityId, event, 'remove')
  }

  async updateFollowerCount(
    entityId: string,
    event: InsertEvent<Following> | RemoveEvent<Following>,
    type: 'insert' | 'remove'
  ) {
    let following: User
    let follower: User
    const followingRepository = event.manager.getRepository(Following)
    const userRepository = event.manager.getRepository(User)

    // The entity only exists in certain scenarios
    // otherwise it needs to be loaded.
    if (event.entity && event.entity.following && event.entity.follower) {
      following = event.entity.following
      follower = event.entity.follower
    } else if (entityId) {
      const follow = await followingRepository.findOne(entityId, {
        relations: ['following', 'follower']
      })
      following = follow.following
      follower = follow.follower
    } else {
      // Bail out. Delete or querybuilder was used instead of remove
      // Subscribers require the entity to be passed in order to act
      // on it.
      return
    }

    if (type === 'insert') {
      await userRepository.increment({ id: following.id }, 'followers_total', 1)
      await userRepository.increment({ id: follower.id }, 'following_total', 1)
    } else {
      await userRepository.decrement({ id: following.id }, 'followers_total', 1)
      await userRepository.decrement({ id: follower.id }, 'following_total', 1)
    }
  }
}
