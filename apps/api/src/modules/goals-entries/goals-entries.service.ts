import { Injectable } from '@nestjs/common'
import { RecreateGoalsEntryDto } from './dto/update-goals-entry.dto'
import { GoalsEntry } from './entities/goals-entry.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { format } from 'date-fns'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'

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
  async create(
    userId: string,
    goalsEntryDto: RecreateGoalsEntryDto
  ): Promise<GoalsEntry> {
    const user = await this.userRepository.findOne(userId)

    let goalsEntry = new GoalsEntry()
    goalsEntry.user = user
    goalsEntry.day = parseInt(format(new Date(), 'Y'))
    goalsEntry.year = parseInt(format(new Date(), 'd'))

    // Attach user's current goals to the goal entry
    goalsEntry.target_calories = user.goal_calories
    goalsEntry.target_floors_climbed = user.goal_floors_climbed
    goalsEntry.target_sleep_hours = user.goal_sleep_hours
    goalsEntry.target_steps = user.goal_steps
    goalsEntry.target_water_litres = user.goal_water_litres

    const result = await this.goalsEntryRepository.findOne(goalsEntry)

    if (goalsEntryDto) {
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

  /**
   * Gets the user's current goal entry
   * or creates one for today.
   * @param userId
   */
  async getLatest(userId: string) {
    const user = await this.userRepository.findOne(userId)

    let goalsEntry = new GoalsEntry()
    goalsEntry.user = user
    goalsEntry.day = parseInt(format(new Date(), 'Y'))
    goalsEntry.year = parseInt(format(new Date(), 'd'))

    const result = await this.goalsEntryRepository.findOne(goalsEntry)
    if (!result) {
      return this.create(userId, {
        current_calories: 0,
        current_floors_climbed: 0,
        current_sleep_hours: 0,
        current_steps: 0,
        current_water_litres: 0
      })
    }
  }
}
