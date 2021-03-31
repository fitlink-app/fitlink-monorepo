import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { getManager, Repository } from 'typeorm'
import { Pagination } from '../../helpers/paginate'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { Sport } from '../sports/entities/sport.entity'
import { Team } from '../teams/entities/team.entity'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { League } from './entities/league.entity'

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,

    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,

    @InjectRepository(Team)
    private teamRepository: Repository<Team>
  ) {}

  async create(createLeagueDto: CreateLeagueDto, teamId?: string) {
    // Get a sport ID;
    const { sportId, name, description } = createLeagueDto
    const league: Partial<League> = { name, description }

    league.sport = new Sport()
    league.sport.id = sportId
    league.active_leaderboard = new Leaderboard()

    if (teamId) {
      const team = await this.teamRepository.findOne({ id: teamId })
      if (!team)
        throw new NotFoundException(`The Team with ID ${teamId} does not exist`)
      league.team = team
    }

    const createdLeague = await this.leaguesRepository.save(
      this.leaguesRepository.create(league)
    )

    const leaderboard = new Leaderboard()
    leaderboard.league = createdLeague
    const newLeaderboard = await this.leaderboardRepository.save(
      this.leaderboardRepository.create(leaderboard)
    )

    await this.leaguesRepository
      .createQueryBuilder()
      .relation(League, 'active_leaderboard')
      .of(createdLeague)
      .set(newLeaderboard)

    return newLeaderboard
  }

  async findAll() {
    const [results, total] = await this.leaguesRepository.findAndCount()
    return new Pagination<League>({
      results,
      total
    })
  }

  async getAllLeaguesForTeam(teamId: string): Promise<Pagination<League>> {
    const [results, total] = await this.leaguesRepository.findAndCount({
      where: {
        team: teamId
      }
    })

    return new Pagination<League>({
      results,
      total
    })
  }

  async getTeamLeagueWithId(id: string, team: string) {
    const result = await this.leaguesRepository.findOne({ where: { team, id } })
    if (!result) {
      throw new NotFoundException()
    }
    return result
  }

  async findOne(id: string) {
    const result = await this.leaguesRepository.findOne(id)
    if (!result) {
      throw new NotFoundException(`League with ID ${id} not found`)
    }
    return result
  }

  async update(id: string, updateLeagueDto: UpdateLeagueDto, teamId?: string) {
    if (teamId) {
      return await this.leaguesRepository.save({
        id,
        team: { id: teamId },
        ...updateLeagueDto
      })
    } else {
      // This Method supports partial updating since all undefined properties are skipped
      return await this.leaguesRepository.save({
        id,
        ...updateLeagueDto
      })
    }
  }

  async remove(id: string, team?: string) {
    let league: League
    if (team) {
      league = await this.leaguesRepository.findOne({
        relations: ['leaderboards'],
        where: {
          team,
          id
        }
      })
    } else {
      league = await this.leaguesRepository.findOne(id, {
        relations: ['leaderboards']
      })
    }
    const result = await getManager().transaction(async (entityManager) => {
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
