import { Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../../users/entities/user.entity'
import { IsNull, Not, Repository } from 'typeorm'
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
import { UserPointsIncrementedEvent } from '../../users/events/user-points-incremented.event'
import { Events } from '../../../../src/events'
import { LeaguesService } from '../leagues.service'
import { SqsMessageHandler, SqsService } from '@ssut/nestjs-sqs'
import { BfitActivityTypes } from '../../bfit/bfit.types'
import { BfitDistributionSenderService } from '../../bfit/bfit-producer.service'
import { v4 } from 'uuid'

@Injectable()
export class HealthActivityCreatedListener {
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(HealthActivity)
    private healthActivityRepository: Repository<HealthActivity>,

    @InjectRepository(LeaderboardEntry)
    private leaderboardEntriesRepository: Repository<LeaderboardEntry>,

    @InjectRepository(League)
    private leaguesRepository: Repository<League>,



    @InjectRepository(User)
    private userRepository: Repository<User>,
    private feedItemService: FeedItemsService,
    private leaguesService: LeaguesService,
    private readonly sqsService: SqsService,
    private readonly bfitDistributionSenderService: BfitDistributionSenderService,
  ) {}

  // Updated method to do manual saving instead of using the increment method.
  // Because then I could give the event emitter an up to date version of the user's points
  async updateUserPoints(points: number, userId: string, active_time?: number) {
    const [user, userErr] = await tryAndCatch(
      this.userRepository.findOne(userId)
    )

    const [updatedUser, updatedUserErr] = await tryAndCatch(
      this.userRepository.save({
        ...user,
        points_total: user.points_total + points
      })
    )
    userErr && console.error(userErr)
    updatedUserErr && console.error(updatedUserErr)
    !userErr &&
      !updatedUserErr &&
      (await this.triggerUserPointsIncrementedEvent(
        updatedUser.points_total,
        user.points_total,
        user.id,
        active_time
      ))
  }

  async triggerUserPointsIncrementedEvent(
    newPoints: number,
    prevPoints: number,
    userId: string,
    active_time: number
  ) {
    const event = new UserPointsIncrementedEvent()
    event.new_points = newPoints
    event.prev_points = prevPoints
    event.user_id = userId
    event.active_time = active_time || 0
    await this.eventEmitter.emitAsync(Events.USER_POINTS_INCREMENTED, event)
  }

  async updateLeaguePoints(sport: Sport, userId: string, points: number) {
    const [leagues, leaguesErr] = await tryAndCatch(
      this.leaguesRepository.find({
        where: { sport, active_leaderboard: Not(IsNull()) },
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

  @OnEvent(Events.HEALTH_ACTIVITY_CREATED)
  async updateUserPointsInLeague(payload: HealthActivityCreatedEvent) {
    const healthActivity = await this.findHealthActivity(
      payload.health_activity_id
    )
    const { sport, user, points } = healthActivity

    const promises = [
      this.updateUserPoints(points, user.id, healthActivity.active_time),
      this.updateLeaguePoints(sport, user.id, points),
      this.addFeedItem(user, healthActivity)
    ]
    await Promise.all(promises)

    // we go to SQS service to update user bfit due to it needing to be first in first out
    this.bfitDistributionSenderService.sendToQueue(
      healthActivity.id + '-' + v4(),
      BfitActivityTypes.sport,
      user.id,
      {
        sport,
      }
    );
  }
}
