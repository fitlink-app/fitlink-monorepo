import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { getManager, Repository } from 'typeorm'
import { PaginationOptionsInterface, Pagination } from '../../helpers/paginate'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { Sport } from '../sports/entities/sport.entity'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { League } from './entities/league.entity'

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>
  ) {}
  async create(createLeagueDto: CreateLeagueDto) {
    // Get a sport ID;
    const { sportId, name, description } = createLeagueDto
    const league: {
      name: string
      description: string
      sport?: { id: string }
      active_leaderboard?: any
    } = { name, description }

    league.sport = new Sport()
    league.sport.id = sportId
    league.active_leaderboard = new Leaderboard()

    const createdLeague = await this.leaguesRepository.save(
      this.leaguesRepository.create(league)
    )

    const leaderboard = new Leaderboard()
    leaderboard.league = createdLeague
    const newLeaderboard = await this.leaderboardRepository.save(
      this.leaderboardRepository.create(leaderboard)
    )

    return await this.leaguesRepository
      .createQueryBuilder()
      .relation(League, 'active_leaderboard')
      .of(createdLeague)
      .set(newLeaderboard)
  }

  async findAll(
    options: PaginationOptionsInterface
  ): Promise<Pagination<League>> {
    const [results, total] = await this.leaguesRepository.findAndCount()
    return new Pagination<League>({
      results,
      total
    })
  }

  async findOne(id: string) {
    const result = await this.leaguesRepository.findOne(id)
    if (!result) {
      throw new NotFoundException(`League with ID ${id} not found`)
    }
    return result
  }

  async update(id: string, updateLeagueDto: UpdateLeagueDto) {
    const result = await this.leaguesRepository.update(id, updateLeagueDto)
    if (result.affected === 0) {
      throw new NotFoundException(`League With ID: ${id} not found`)
    }
  }

  async remove(id: string) {
    const league = await this.leaguesRepository.findOne(id, {
      relations: ['leaderboards']
    })
    const result = await getManager().transaction(async (entityManager) => {
      // Delete all the leaderboards with this legaue id;

      if (league.leaderboards.length) {
        await entityManager.delete(
          Leaderboard,
          league.leaderboards.map((entity) => entity.id)
        )
      }
      return await entityManager.delete(League, league.id)
    })
    return result
  }
}
