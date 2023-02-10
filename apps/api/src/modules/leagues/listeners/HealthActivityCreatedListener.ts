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
import { LeagueAccess } from '../leagues.constants'
import { LeagueBfitEarnings } from '../entities/bfit-earnings.entity'
import { WalletTransaction } from '../../wallet-transactions/entities/wallet-transaction.entity'
import { WalletTransactionSource } from '../../wallet-transactions/wallet-transactions.constants'

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

    @InjectRepository(LeagueBfitEarnings)
    private leagueBfitEarningsRepository: Repository<LeagueBfitEarnings>,

    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private feedItemService: FeedItemsService
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

  async updateLeagueBfit(sport: Sport, userId: string) {
    // $BFIT = daily_bfit * user_league_points / total_user_league_points
    // daily_bfit = (league_participants/total_compete_to_earn_league_participants* 6850)
    // 6850 is the amount of bfit minted daily
    const [leagues, leaguesErr] = await tryAndCatch(
      this.leaguesRepository.find({
        where: {
          sport,
          active_leaderboard: Not(IsNull()),
          access: LeagueAccess.CompeteToEarn
        },
        relations: ['active_leaderboard', 'users']
      })
    )
    leaguesErr && console.error(leaguesErr)
    const incrementEntryPromises = []
    let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .where('league.access = :access', {
        access: LeagueAccess.CompeteToEarn
      })
      .select('COUNT(user.id)', 'totalUsers')
      .getRawOne()

    totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers
    for (const league of leagues) {
      const leagueUsers = league.participants_total
      // we multiply by 1000000 because BFIT has 6 decimals
      const dailyBfit = Math.round(
        (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
      )
      const { points } = await this.leaderboardEntriesRepository.findOne({
        user_id: userId,
        league_id: league.id
      })
      let total_user_league_points = await this.leaderboardEntriesRepository
        .createQueryBuilder('leaderboard_entry')
        .select('SUM(leaderboard_entry.points)', 'totalPoints')
        .where('leaderboard_entry.league_id = :leagueId', {
          leagueId: league.id
        })
        .getRawOne()
      total_user_league_points = parseInt(
        total_user_league_points.totalPoints,
        10
      )
      // we multiply by 1000_000 because $BFIT has 6 decimals
      let bfit = dailyBfit * ((points / total_user_league_points) * 1000_000)
      // increment user bfit
      incrementEntryPromises.push(
        this.leaderboardEntriesRepository.increment(
          {
            leaderboard: { id: league.active_leaderboard.id },
            user: { id: userId }
          },

          'bfit_earned',
          bfit
        )
      )
      // increment total league bfit
      incrementEntryPromises.push(
        this.leaguesRepository.increment(
          {
            id: league.id
          },

          'bfit',
          bfit
        )
      )

      let bfitEarnings = new LeagueBfitEarnings()
      bfitEarnings.user_id = userId
      bfitEarnings.league_id = league.id
      bfitEarnings.bfit_amount = bfit
      let savedEarnings = await this.leagueBfitEarningsRepository.save(
        bfitEarnings
      )
      let walletTransaction = new WalletTransaction()
      walletTransaction.source = WalletTransactionSource.LeagueBfitEarnings
      walletTransaction.earnings_id = savedEarnings.id
      walletTransaction.league_id = league.id
      walletTransaction.league_name = league.name
      walletTransaction.user_id = userId
      walletTransaction.bfit_amount = bfit
      incrementEntryPromises.push(
        this.walletTransactionRepository.save(walletTransaction)
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
    // update league bfit after user points and league points have been updated
    await this.updateLeagueBfit(sport, user.id)
  }
}
