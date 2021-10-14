import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { tryAndCatch } from '../../../../src/helpers/tryAndCatch'
import { Repository } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { League } from '../entities/league.entity'
import { LeagueJoinedEvent } from '../events/league-joined.event'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'
import { Events } from '../../../../src/events'

@Injectable()
export class LeagueJoinedListener {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(League)
    private leagueRepository: Repository<League>,

    private feedItemService: FeedItemsService
  ) {}

  @OnEvent(Events.LEAGUE_JOINED)
  async leagueJoined({ userId, leagueId }: LeagueJoinedEvent) {
    const [league, leagueErr] = await tryAndCatch(
      this.leagueRepository.findOne({ id: leagueId })
    )
    const [user, userErr] = await tryAndCatch(
      this.userRepository.findOne({ id: userId })
    )

    leagueErr && console.error(leagueErr)
    userErr && console.error(userErr)

    const [_, error] = await tryAndCatch(
      this.feedItemService.create({
        user,
        league,
        type: FeedItemType.LeagueJoined,
        category: FeedItemCategory.MyUpdates
      })
    )

    error && console.error(error)
  }
}
