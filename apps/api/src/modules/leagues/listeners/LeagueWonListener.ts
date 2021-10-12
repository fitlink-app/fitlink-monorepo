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
import { User } from '../../users/entities/user.entity'
import { League } from '../entities/league.entity'
import { LeagueWonEvent } from '../events/league-won.event'
import { NotificationsService } from '../../notifications/notifications.service'
import { NotificationAction } from '../../notifications/notifications.constants'

@Injectable()
export class LeagueWonListener {
  constructor(
    private feedItemService: FeedItemsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,

    private notificationsService: NotificationsService
  ) {}

  @OnEvent('league.won')
  async leagueWon(payload: LeagueWonEvent) {
    const user = await this.userRepository.findOne(payload.userId)
    const league = await this.leagueRepository.findOne(payload.leagueId, {
      relations: ['image']
    })

    try {
      await this.feedItemService.create({
        category: FeedItemCategory.MyUpdates,
        type: FeedItemType.LeagueWon,
        user,
        league
      })

      await this.notificationsService.create({
        action: NotificationAction.LeagueWon,
        subject: league.name,
        subject_id: league.id,
        avatar: league.image,
        user: user
      })
    } catch (e) {
      console.error(e)
    }
  }
}
