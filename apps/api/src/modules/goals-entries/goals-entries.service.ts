import { Injectable, NotFoundException } from '@nestjs/common'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import {
  GoalsEntry,
  GoalsEntryCurrent,
  GoalsEntryTarget
} from './entities/goals-entry.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, MoreThan, MoreThanOrEqual, Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { zonedStartOfDay } from '../../../../common/date/helpers'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { DailyGoalsReachedEvent } from './events/daily-goals-reached.event'
import { FeedGoalType } from '../feed-items/feed-items.constants'
import { Events } from '../../events'
import { CommonService } from '../common/services/common.service'
import { startOfDay } from 'date-fns'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationAction } from '../notifications/notifications.constants'
import { differenceInMilliseconds } from 'date-fns'
import { League } from '../leagues/entities/league.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { LeagueAccess } from '../leagues/leagues.constants'
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { WalletTransactionSource } from '../wallet-transactions/wallet-transactions.constants'
import { LeaguesService } from '../leagues/leagues.service'

interface GoalField {
  field:
    | 'current_floors_climbed'
    | 'current_mindfulness_minutes'
    | 'current_sleep_hours'
    | 'current_steps'
    | 'current_water_litres'
    | 'current_active_minutes'
  current?: number
  target: number
  feedType: FeedGoalType
}

@Injectable()
export class GoalsEntriesService {
  constructor(
    @InjectRepository(GoalsEntry)
    private goalsEntryRepository: Repository<GoalsEntry>,

    @InjectRepository(League)
    private leaguesRepository: Repository<League>,

    @InjectRepository(LeaderboardEntry)
    private leaderboardEntriesRepository: Repository<LeaderboardEntry>,

    @InjectRepository(LeagueBfitEarnings)
    private leagueBfitEarningsRepository: Repository<LeagueBfitEarnings>,

    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
    private commonService: CommonService,
    private notificationsService: NotificationsService,
    private leaguesService: LeaguesService
  ) {}

  formatFields(
    current: GoalsEntryCurrent,
    target: GoalsEntryTarget
  ): GoalField[] {
    return [
      {
        field: 'current_floors_climbed',
        current: current.current_floors_climbed || 0,
        target: target.target_floors_climbed,
        feedType: FeedGoalType.FloorsClimbed
      },
      {
        field: 'current_mindfulness_minutes',
        current: current.current_mindfulness_minutes || 0,
        target: target.target_mindfulness_minutes,
        feedType: FeedGoalType.MindfulnessMinutes
      },
      {
        field: 'current_sleep_hours',
        current: current.current_sleep_hours || 0,
        target: target.target_sleep_hours,
        feedType: FeedGoalType.SleepHours
      },
      {
        field: 'current_steps',
        current: current.current_steps || 0,
        target: target.target_steps,
        feedType: FeedGoalType.Steps
      },
      {
        field: 'current_water_litres',
        current: current.current_water_litres || 0,
        target: target.target_water_litres,
        feedType: FeedGoalType.WaterLitres
      },
      {
        field: 'current_active_minutes',
        current: current.current_active_minutes || 0,
        target: target.target_active_minutes,
        feedType: FeedGoalType.ActiveMinutes
      }
    ]
  }

  /**
   * Creates goals entry
   * @param userId
   * @param goalsEntryDto
   */
  async createOrUpdate(
    userId: string,
    goalsEntryDto: RecreateGoalsEntryDto
  ): Promise<GoalsEntry> {
    const user = await this.userRepository.findOne(userId)
    let goalsEntry = await this.getLatest(userId)

    // Attach the latest user's current goals to the goal entry
    goalsEntry.target_mindfulness_minutes = user.goal_mindfulness_minutes
    goalsEntry.target_floors_climbed = user.goal_floors_climbed
    goalsEntry.target_sleep_hours = user.goal_sleep_hours
    goalsEntry.target_steps = user.goal_steps
    goalsEntry.target_water_litres = user.goal_water_litres
    goalsEntry.target_active_minutes = user.goal_active_minutes

    // Only update values that are greater than previously stored
    let targetReached: GoalField[] = []
    const entries = this.formatFields(goalsEntryDto || {}, goalsEntry)

    let hasRealUpdate = false

    const currentSteps = goalsEntry.current_steps
    const nextSteps = (goalsEntryDto || {}).current_steps || 0

    entries.forEach((each) => {
      // Only update if the incoming entry exceeds the previous entry value
      if (each.current >= goalsEntry[each.field]) {
        // Check if the current value was previously lower than target and is now "reached"
        if (
          goalsEntry[each.field] < each.target &&
          each.current >= each.target
        ) {
          targetReached.push(each)
        }

        goalsEntry[each.field] = each.current

        hasRealUpdate = true
      }
    })
    const goalEntryReachedEvent = new DailyGoalsReachedEvent()
    goalEntryReachedEvent.goalEntryId = goalsEntry.id
    goalEntryReachedEvent.userId = user.id

    const triggerEventPromises = []
    targetReached.forEach((each) => {
      triggerEventPromises.push(
        this.triggerEvent(goalEntryReachedEvent, each.feedType)
      )
    })

    await Promise.all(triggerEventPromises)

    if (!goalsEntry.created_at) {
      goalsEntry.created_at = zonedStartOfDay(user.timezone)
      goalsEntry.updated_at = zonedStartOfDay(user.timezone)
    }

    // Ensure user is set
    goalsEntry.user = new User()
    goalsEntry.user.id = user.id

    return this.goalsEntryRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(GoalsEntry)
      const userRepo = manager.getRepository(User)
      const leagueRepo = manager.getRepository(League)
      const leaderboardEntry = manager.getRepository(LeaderboardEntry)
      const result = await repo.save(goalsEntry)
      if (hasRealUpdate) {
        await userRepo.update(user.id, {
          last_lifestyle_activity_at: new Date(),
          goal_percentage: this.calculateGoalsPercentage(goalsEntry)
        })

        // If steps need to be processed onto steps leagues
        if (nextSteps > currentSteps) {
          const stepsLeagues = await leagueRepo
            .createQueryBuilder('league')
            .innerJoinAndSelect('league.active_leaderboard', 'leaderboard')
            .innerJoinAndSelect('league.sport', 'sport')
            .leftJoin('leaderboard.entries', 'entries')
            .where('entries.user.id = :userId', { userId: user.id })
            .andWhere('sport.name_key = :steps', { steps: 'steps' })
            .getMany()

          let stepsAdd = nextSteps - currentSteps

          await Promise.all(
            stepsLeagues.map((each) => {
              return leaderboardEntry.increment(
                {
                  leaderboard: { id: each.active_leaderboard.id },
                  user: { id: user.id }
                },
                'points',
                stepsAdd
              )
            })
          )
          // update bfit in compete to earn step leagues after points have been added
          this.updateStepsLeagueBfit(user.id)
        }
      }

      return result
    })
  }

  async updateStepsLeagueBfit(userId: string) {
    // $BFIT = daily_bfit * user_league_points / total_user_league_points
    // daily_bfit = (league_participants/total_compete_to_earn_league_participants* 6850)
    // 6850 is the amount of bfit minted daily
    const competeToEarnStepsLeagues = await this.leaguesRepository
      .createQueryBuilder('league')
      .innerJoinAndSelect('league.active_leaderboard', 'leaderboard')
      .innerJoinAndSelect('league.sport', 'sport')
      .leftJoin('leaderboard.entries', 'entries')
      .where('entries.user.id = :userId', { userId })
      .andWhere('sport.name_key = :steps', { steps: 'steps' })
      .andWhere('league.access = :leagueAccess', {
        leagueAccess: LeagueAccess.CompeteToEarn
      })
      .getMany()
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
    for (const league of competeToEarnStepsLeagues) {
      const leagueUsers = league.participants_total
      // we multiply by 1000000 because BFIT has 6 decimals
      const dailyBfit = Math.round(
        (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
      )

      const alreadyDistributedAmount =
        await this.leaguesService.getUserTotalLeagueDailyBfitEarnings(league.id)
      const dailyBfitInFullDecimals = dailyBfit * 1000000
      let amountAvailableToDistribute =
        (dailyBfitInFullDecimals - alreadyDistributedAmount.total) / 1000000
      if (amountAvailableToDistribute <= 0) {
        amountAvailableToDistribute = 0
      }

      const existingLeaderboardEntry =
        await this.leaderboardEntriesRepository.findOne({
          user_id: userId,
          league_id: league.id
        })
      if (existingLeaderboardEntry) {
        const points = existingLeaderboardEntry.points
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
        let bfit = Math.round(
          amountAvailableToDistribute *
            ((points / total_user_league_points) * 1000_000)
        )
        if (bfit > 0) {
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
      }
    }

    await Promise.all(incrementEntryPromises)
  }

  async updateTargets(userId: string) {
    const user = await this.userRepository.findOne(userId)
    const latest = await this.getLatest(userId)
    if (latest.id) {
      return this.goalsEntryRepository.update(latest.id, {
        target_floors_climbed: user.goal_floors_climbed,
        target_steps: user.goal_steps,
        target_mindfulness_minutes: user.goal_mindfulness_minutes,
        target_water_litres: user.goal_water_litres,
        target_sleep_hours: user.goal_sleep_hours,
        target_active_minutes: user.goal_active_minutes
      })
    } else {
      return false
    }
  }

  calculateGoalsPercentage(goalsEntry: GoalsEntry) {
    const d1 = goalsEntry.current_steps / goalsEntry.target_steps
    const d2 =
      goalsEntry.current_floors_climbed / goalsEntry.target_floors_climbed
    const d3 = goalsEntry.current_water_litres / goalsEntry.target_water_litres
    const d4 = goalsEntry.current_sleep_hours / goalsEntry.target_sleep_hours
    const d5 =
      goalsEntry.current_mindfulness_minutes /
      goalsEntry.target_mindfulness_minutes
    const d6 =
      goalsEntry.current_active_minutes / goalsEntry.target_active_minutes

    const total = [d1, d2, d3, d4, d5, d6]
      .map((i) => (i > 1 ? 1 : i))
      .reduce((a, b) => a + b, 0)
    return Math.round((total / 5) * 100) / 100
  }

  async triggerEvent(
    goalEntryReachedEvent: DailyGoalsReachedEvent,
    goal_type: FeedGoalType
  ) {
    goalEntryReachedEvent.goal_type = goal_type
    await this.eventEmitter.emitAsync(
      Events.DAILY_GOAL_REACHED,
      goalEntryReachedEvent
    )
  }
  /**
   * Find a specific goals entry
   */
  async findOne(goalsEntry) {
    return await this.goalsEntryRepository.findOne(goalsEntry)
  }

  /**
   * Finds all goal entries for a specific user
   * @param userId
   * @param param1
   * @returns
   */
  async findAll(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ): Promise<Pagination<GoalsEntry>> {
    const [results, total] = await this.goalsEntryRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: limit * page,
      order: { created_at: 'DESC' }
    })

    return new Pagination<GoalsEntry>({
      results,
      total
    })
  }

  async getExistingEntry(user: User) {
    return this.goalsEntryRepository.findOne({
      where: {
        created_at: MoreThanOrEqual(zonedStartOfDay(user.timezone)),
        user: { id: user.id }
      }
    })
  }

  /**
   * Gets the user's current goal entry
   * or creates one for today.
   * @param userId
   */
  async getLatest(userId: string): Promise<GoalsEntry> {
    const user = await this.userRepository.findOne(userId)
    if (!user) {
      throw new NotFoundException()
    }
    const result = await this.getExistingEntry(user)

    if (!result) {
      return this.getEmptyEntry(user)
    }

    return result
  }

  /**
   * Returns a placeholder goal entry entity
   * if one for the day is not available
   *
   * @param user
   * @returns
   */
  getEmptyEntry(user: User) {
    const goalsEntry = new GoalsEntry()

    // Attach user's current goals to the goal entry
    goalsEntry.target_mindfulness_minutes = user.goal_mindfulness_minutes
    goalsEntry.target_floors_climbed = user.goal_floors_climbed
    goalsEntry.target_sleep_hours = user.goal_sleep_hours
    goalsEntry.target_steps = user.goal_steps
    goalsEntry.target_water_litres = user.goal_water_litres
    goalsEntry.target_active_minutes = user.goal_active_minutes
    goalsEntry.current_steps = 0
    goalsEntry.current_floors_climbed = 0
    goalsEntry.current_water_litres = 0
    goalsEntry.current_sleep_hours = 0
    goalsEntry.current_mindfulness_minutes = 0
    goalsEntry.current_active_minutes = 0

    return goalsEntry
  }

  async processPendingGoalReminders() {
    const started = new Date()

    const goals = await this.goalsEntryRepository.find({
      where: {
        created_at: MoreThan(startOfDay(new Date())),
        notified_at: IsNull()
      },
      relations: ['user']
    })

    const notify: { user: User; steps: number }[] = []
    goals.forEach((goal) => {
      if (goal.current_steps > 0) {
        const diff = goal.current_steps / goal.target_steps
        if (diff < 1 && diff >= 0.5) {
          notify.push({
            user: goal.user,
            steps: goal.target_steps - goal.current_steps
          })
        }
      }
    })

    if (notify.length) {
      // Ensure these users aren't notified a second time today
      await this.goalsEntryRepository.update(
        goals.map((e) => e.id),
        {
          notified_at: new Date()
        }
      )
    }

    const messages = await Promise.all(
      notify.map(({ user, steps }) => {
        return this.notificationsService.sendAction(
          [user],
          NotificationAction.GoalProgressSteps,
          {
            meta_value: String(steps)
          }
        )
      })
    )

    await this.commonService.notifySlackJobs(
      'Steps goal reminder',
      {
        reminded: notify.length,
        messages
      },
      differenceInMilliseconds(started, new Date())
    )

    return {
      count: notify.length,
      messages
    }
  }
}
