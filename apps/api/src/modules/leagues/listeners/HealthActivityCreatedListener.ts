import { Injectable, NotFoundException } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../../users/entities/user.entity'
import { Repository } from 'typeorm'
import { HealthActivity } from '../../health-activities/entities/health-activity.entity'
import { HealthActivityCreatedEvent } from '../../health-activities/events/health-activity-created.event'
import { LeaderboardEntry } from '../../leaderboard-entries/entities/leaderboard-entry.entity'
import { League } from '../entities/league.entity'
import { tryAndCatch } from '../../../helpers/tryAndCatch'
import { Sport } from '../../sports/entities/sport.entity'
import { FeedItemsService } from '../../feed-items/feed-items.service'
import {
  FeedItemCategory,
  FeedItemType
} from '../../feed-items/feed-items.constants'

@Injectable()
export class HealthActivityCreatedListener {
  constructor(
    @InjectRepository(HealthActivity)
    private healthActivityRepository: Repository<HealthActivity>,

    @InjectRepository(LeaderboardEntry)
    private leaderboardEntriesRepository: Repository<LeaderboardEntry>,

    @InjectRepository(League)
    private leaguesRepository: Repository<League>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private feedItemService: FeedItemsService
  ) {}

  async updateUserPoints(points: number, userId: string) {
    const [_, resultErr] = await tryAndCatch(
      this.userRepository.increment({ id: userId }, 'points_total', points)
    )
    resultErr && console.error(resultErr)
  }

  async updateLeaguePoints(sport: Sport, userId: string, points: number) {
    const [leagues, leaguesErr] = await tryAndCatch(
      this.leaguesRepository.find({
        where: { sport },
        relations: ['active_leaderboard', 'users']
      })
    )
    leaguesErr && console.error(leaguesErr)
    const incrementEntryPromises = []
    for (const league of leagues) {
      incrementEntryPromises.push(
        this.leaderboardEntriesRepository.increment(
          {
            leaderboard: { id: league.active_leaderboard.id },
            user: { id: userId }
          },

          'points',
          points
        )
      )
    }

    await Promise.all(incrementEntryPromises)
  }

  async findHealthActivity(id: string): Promise<HealthActivity> {
    const [healthActivity, healthActivityErr] = await tryAndCatch(
      this.healthActivityRepository.findOne(id, {
        relations: ['sport', 'user']
      })
    )
    if (healthActivityErr) {
      throw new NotFoundException(`Health Activity With That ID Not Found`)
    }
    return healthActivity
  }
  async updateHealthActivityStatus(healthActivity: HealthActivity) {
    const [_, resultErr] = await tryAndCatch(
      this.healthActivityRepository.save({
        ...healthActivity,
        distributed: true
      })
    )
    resultErr && console.error(resultErr)
  }

  async addFeedItem(user: User, health_activity: HealthActivity) {
    await this.feedItemService.create({
      category: FeedItemCategory.MyActivities,
      type: FeedItemType.HealthActivity,
      user,
      health_activity
    })
  }

  @OnEvent('health_activity.created')
  async updateUserPointsInLeague(payload: HealthActivityCreatedEvent) {
    const healthActivity = await this.findHealthActivity(
      payload.health_activity_id
    )
    const { sport, user, points } = healthActivity
    await this.updateUserPoints(points, user.id)
    await this.updateLeaguePoints(sport, user.id, points)
    await this.addFeedItem(user, healthActivity)
  }
}
