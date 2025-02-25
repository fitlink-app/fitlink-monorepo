import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { CreateLeaderboardEntryDto } from './dto/create-leaderboard-entry.dto'
import { LeaderboardEntry } from './entities/leaderboard-entry.entity'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { User } from '../users/entities/user.entity'
import { League } from '../leagues/entities/league.entity'
import { LeagueAccess } from '../leagues/leagues.constants'

@Injectable()
export class LeaderboardEntriesService {
  constructor(
    @InjectRepository(LeaderboardEntry)
    private leaderboardEntryRepository: Repository<LeaderboardEntry>,

    @InjectRepository(League)
    private leaguesRepository: Repository<League>
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
   * Find the
   * @param userId
   * @param leaderboardId
   * @returns
   */

  /**
   * Find a single user's rank and flanks in a leaderboard
   * @param userId
   * @returns
   */
  async findRankAndFlanksInLeaderboard(userId: string, leaderboardId: string) {
    let query = this.queryLeaderboardRank(leaderboardId)
    query = query.where('rank.user_id = :userId', { userId })

    const userRank = await query.getRawMany()

    if (userRank.length) {
      const prev = await this.queryLeaderboardFlanks(
        leaderboardId,
        userId,
        userRank[0].rank,
        'prev'
      )
      const next = await this.queryLeaderboardFlanks(
        leaderboardId,
        userId,
        userRank[0].rank,
        'next'
      )
      return {
        user: userRank[0] as LeaderboardEntry,
        flanks: {
          prev: prev as LeaderboardEntry,
          next: next as LeaderboardEntry
        }
      }
    } else {
      return undefined
    }
  }

  /**
   * Gets the flanks of a particular user in ranks
   *
   * @param leaderboardId
   * @param userId
   * @param rank
   * @param type
   * @returns object
   */
  async queryLeaderboardFlanks(
    leaderboardId: string,
    userId: string,
    rank: number,
    type: 'next' | 'prev'
  ) {
    let query = this.queryLeaderboardRank(leaderboardId)
      .orderBy('rank', type === 'next' ? 'ASC' : 'DESC')
      .where('rank.user_id != :userId', { userId })
      .limit(1)

    if (type === 'next') {
      query = query.andWhere('rank.rank >= :rank', { rank })
    }

    if (type === 'prev') {
      query = query.andWhere('rank.rank <= :rank', { rank })
    }

    // console.log( query.getSql() )

    const results = await query.getRawMany()

    return results[0]
  }

  /**
   *
   * @param userId
   * @returns
   */
  queryLeaderboardRank(leaderboardId: string) {
    return this.leaderboardEntryRepository.manager
      .createQueryBuilder()
      .select('rank.*')
      .from((q) => {
        return q
          .select(
            'RANK() OVER (ORDER BY points DESC, updated_at DESC) AS rank, entry.*'
          )
          .from(LeaderboardEntry, 'entry')
          .where(`leaderboard_id = :leaderboardId`, { leaderboardId })
      }, 'rank')
  }

  /**
   * Find a single user's ranks in their latest leaderboards,
   * ignoring previous leaderboards of a league
   * @param string userId
   * @param array LeaderboardEntry[]
   */
  async findRankInLeaderboards(userId: string): Promise<LeaderboardEntry[]> {
    const query = this.leaderboardEntryRepository.manager
      .createQueryBuilder()
      .select('DISTINCT ON (leaderboard_id) rank.*')
      .from((q) => {
        return q
          .select(
            'RANK() OVER (PARTITION BY leaderboard_id ORDER BY points DESC) AS rank, entry.*'
          )
          .from(LeaderboardEntry, 'entry')
          .where(
            `leaderboard_id IN (
            SELECT DISTINCT ON (league_id) entry.leaderboard_id FROM public.leaderboard_entry entry
            WHERE user_id = :userId
            ORDER BY league_id, updated_at DESC
          )`,
            { userId }
          )
      }, 'rank')
      .where('rank.user_id = :userId', {
        userId
      })

    // console.log( query.getSql() )

    return await query.getRawMany()
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
    const leaderboardEntry = await this.leaderboardEntryRepository.findOne({
      leaderboard_id: leaderboardId
    })
    if (!leaderboardEntry) {
      throw new NotFoundException(
        'Leaderboard entry with the provided leaderboard id not found'
      )
    }
    const league = await this.leaguesRepository.findOne({
      id: leaderboardEntry.league_id
    })

    let query: SelectQueryBuilder<LeaderboardEntry>
    // if (league.access === LeagueAccess.CompeteToEarn) {
    //   query = this.leaderboardEntryRepository
    //     .createQueryBuilder()
    //     .where('leaderboard_id = :leaderboardId', {
    //       leaderboardId
    //     })
    //     .orderBy('bfit_earned', 'DESC')
    //     .addOrderBy('updated_at', 'DESC')
    //     .take(options.limit)
    //     .skip(options.page * options.limit)
    // } else {
      query = this.leaderboardEntryRepository
        .createQueryBuilder()
        .where('leaderboard_id = :leaderboardId', {
          leaderboardId
        })
        .orderBy('points', 'DESC')
        .addOrderBy('updated_at', 'DESC')
        .take(options.limit)
        .skip(options.page * options.limit)
    // }

    // console.log(query.getSql())

    const [results, total] = await query.getManyAndCount()

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
