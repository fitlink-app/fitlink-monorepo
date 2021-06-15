import { Injectable } from '@nestjs/common'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import { GoalsEntry } from './entities/goals-entry.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { zonedStartOfDay } from '../../../../common/date/helpers'

@Injectable()
export class GoalsEntriesService {
  constructor(
    @InjectRepository(GoalsEntry)
    private goalsEntryRepository: Repository<GoalsEntry>,

    @InjectRepository(User)
    private userRepository: Repository<User>
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

    return await this.goalsEntryRepository.save({
      ...result,
      ...goalsEntry
    })
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
    return this.goalsEntryRepository
      .createQueryBuilder('entries')
      .where('entries.created_at >= :start', {
        start: zonedStartOfDay(user.timezone)
      })
      .getOne()
  }

  /**
   * Gets the user's current goal entry
   * or creates one for today.
   * @param userId
   */
  async getLatest(userId: string): Promise<GoalsEntry> {
    const user = await this.userRepository.findOne(userId)

    let goalsEntry = new GoalsEntry()
    goalsEntry.user = user

    const result = this.getCurrentEntry(user)

    if (!result) {
      return this.createOrUpdate(
        userId,
        {
          current_mindfulness_minutes: 0,
          current_floors_climbed: 0,
          current_sleep_hours: 0,
          current_steps: 0,
          current_water_litres: 0
        },
        true
      )
    }

    return result
  }
}
