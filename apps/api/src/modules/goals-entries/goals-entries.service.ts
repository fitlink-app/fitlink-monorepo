import { Injectable } from '@nestjs/common'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import { GoalsEntry } from './entities/goals-entry.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { zonedStartOfDay } from '../../../../common/date/helpers'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { DialyGoalsReachedEvent as GoalEntryReachedEvent } from './events/daily-goals-reached.event'
import { FeedGoalType } from '../feed-items/feed-items.constants'

@Injectable()
export class GoalsEntriesService {
  constructor(
    @InjectRepository(GoalsEntry)
    private goalsEntryRepository: Repository<GoalsEntry>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * Creates goals entry
   * @param userId
   * @param goalsEntryDto
   */
  async createOrUpdate(
    userId: string,
    goalsEntryDto: RecreateGoalsEntryDto,
    newEntry = false
  ): Promise<GoalsEntry> {
    const user = await this.userRepository.findOne(userId)

    let goalsEntry = new GoalsEntry()
    goalsEntry.user = user

    // Attach user's current goals to the goal entry
    goalsEntry.target_mindfulness_minutes = user.goal_mindfulness_minutes
    goalsEntry.target_floors_climbed = user.goal_floors_climbed
    goalsEntry.target_sleep_hours = user.goal_sleep_hours
    goalsEntry.target_steps = user.goal_steps
    goalsEntry.target_water_litres = user.goal_water_litres

    let result: GoalsEntry
    if (!newEntry) {
      result = await this.getCurrentEntry(user)
    }

    // Only update values that are greater than previously stored
    if (result && goalsEntryDto) {
      Object.keys(goalsEntryDto).map((field) => {
        if (goalsEntryDto[field] > goalsEntry[field]) {
          goalsEntry[field] = goalsEntryDto[field]
        }
      })
    } else if (goalsEntryDto) {
      goalsEntry = Object.assign(goalsEntry, { ...goalsEntryDto })
    }

    console.log('The Goal Entry Created -->', goalsEntry)
    console.log('The So called Prev User', user)
    const goalEntryReachedEvent = new GoalEntryReachedEvent()
    goalEntryReachedEvent.goal_entry = goalsEntry
    goalEntryReachedEvent.userId = user.id

    // let goalsArr = Object.entries(FeedGoalType)
    // let promises = []
    // for (let goal of goalsArr) {
    //   const {
    //     current,
    //     prev,
    //     target,
    //     feedGoalType
    //   } = this.genTriggerEventParams(goalsEntry, user, goalsEntry, goal[1])

    //   promises.push(
    //     this.triggerEvent(
    //       current,
    //       prev,
    //       target,
    //       goalEntryReachedEvent,
    //       feedGoalType
    //     )
    //   )
    // }
    //

    await this.triggerEvent(
      goalsEntry.current_sleep_hours,
      user.goal_sleep_hours,
      goalsEntry.target_sleep_hours,
      goalEntryReachedEvent,
      FeedGoalType.SleepHours
    )

    // await Promise.all(promises)
    return await this.goalsEntryRepository.save({
      ...result,
      ...goalsEntry
    })
  }

  genTriggerEventParams(
    currentObj: GoalsEntry,
    prevObj: User,
    targetObj: GoalsEntry,
    type:
      | 'water_litres'
      | 'sleep_hours'
      | 'mindfulness_minutes'
      | 'floors_climbed'
      | 'steps'
  ) {
    let current = currentObj[`current_${type}`]
    let prev = prevObj[`goal_${type}`]
    let target = targetObj[`target_${type}`]
    let feedGoalType = FeedGoalType[this.capitalize(type).replace('_', '')]

    return { current, prev, target, feedGoalType }
  }
  capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  async triggerEvent(
    current: number,
    prevCurrent: number,
    target: number,
    goalEntryReachedEvent: GoalEntryReachedEvent,
    goal_type: FeedGoalType
  ) {
    console.log(`TRIGGER FUNCTION BEING RUN`)
    const shouldTrigger = this.shouldTriggerFeedItem(
      current,
      prevCurrent,
      target,
      1
    )
    console.log('Should Trigger -->', shouldTrigger)
    if (shouldTrigger) {
      console.log(`SHOULD TRIGGERED BEING TRIGGERED`)
      goalEntryReachedEvent.goal_type = goal_type
      await this.eventEmitter.emitAsync(
        'daily_goal.reached',
        goalEntryReachedEvent
      )
    }
  }

  shouldTriggerFeedItem(
    newCurrent: number,
    prevCurrent: number,
    target: number,
    triggerRatio: number
  ) {
    const didChange = newCurrent !== prevCurrent
    const didReachTriggerRatio = newCurrent >= target * triggerRatio
    // How to manage did trigger Before?
    console.log('prevCurrent -->', prevCurrent)
    console.log('target -->', target)
    const didTriggerBefore = prevCurrent >= target * triggerRatio

    return didChange && didReachTriggerRatio && !didTriggerBefore
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

  async getCurrentEntry(user: User) {
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
    const result = await this.getCurrentEntry(user)

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
    goalsEntry.current_steps = 0
    goalsEntry.current_floors_climbed = 0
    goalsEntry.current_water_litres = 0
    goalsEntry.current_sleep_hours = 0
    goalsEntry.current_mindfulness_minutes = 0

    return goalsEntry
  }
}
