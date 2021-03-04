import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard-entry.dto'
import { LeaderboardEntry } from './entities/leaderboard-entry.entity'
import { Pagination, PaginationOptionsInterface } from '../paginate'

@Injectable()
export class LeaderboardEntriesService {
  constructor(
    @InjectRepository(LeaderboardEntry)
    private leaderboardEntryRepository: Repository<LeaderboardEntry>
  ) {}

  /**
   * "Upserts" the leaderboard entry
   * Creates this if it doesn't exist yet,
   * or alternatively updates it.
   * @param createLeaderboardEntryDto
   */
  async create(
    createLeaderboardEntryDto: CreateLeaderboardEntryDto
  ): Promise<LeaderboardEntry> {
    const { leaderboard_id, user_id } = createLeaderboardEntryDto

    const result = await this.leaderboardEntryRepository.findOne({
      where: {
        leaderboard_id,
        user_id
      }
    })

    return await this.leaderboardEntryRepository.save({
      ...result,
      ...createLeaderboardEntryDto,
      created_at: new Date(),
      updated_at: new Date()
    })
  }

  /**
   * Find all entries by leaderboard, with paginated options
   * @param leaderboardId
   * @param options
   */
  async findAll(
    leaderboardId: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<LeaderboardEntry>> {
    const [results, total] = await this.leaderboardEntryRepository.findAndCount(
      {
        where: { leaderboard_id: leaderboardId },
        order: { points: 'DESC' },
        take: options.limit,
        skip: options.page
      }
    )

    return new Pagination<LeaderboardEntry>({
      results,
      total
    })
  }

  /**
   * Find a specific user's leaderboard entry
   * @param leaderboardId
   * @param userId
   */
  async findOne(leaderboardId: string, userId: string) {
    return await this.leaderboardEntryRepository.findOne({
      where: {
        leaderboard_id: leaderboardId,
        user_id: userId
      },
      order: {
        points: 'DESC'
      }
    })
  }

  /**
   * Soft deletes the leaderboard entry
   * @param leaderboardId
   * @param userId
   */
  async remove(leaderboardId: string, userId: string) {
    return await this.leaderboardEntryRepository.softDelete({
      user_id: userId,
      leaderboard_id: leaderboardId
    })
  }
}
