import { Injectable, NotFoundException } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, FindOneOptions, getManager, Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { QueueableEventPayload } from '../../models/queueable.model'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { Sport } from '../sports/entities/sport.entity'
import { Team } from '../teams/entities/team.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { League, LeagueAccess } from './entities/league.entity'
import { User, UserPublic } from '../users/entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { plainToClass } from 'class-transformer'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'

type LeagueOptions = {
  teamId?: string
  organisationId?: string
  userId?: string
}

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,

    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,

    @InjectRepository(LeaderboardEntry)
    private leaderboardEntryRepository: Repository<LeaderboardEntry>,

    @InjectRepository(Team)
    private teamRepository: Repository<Team>,

    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private leaderboardEntriesService: LeaderboardEntriesService
  ) {}

  async create(
    createLeagueDto: CreateLeagueDto,
    { teamId, organisationId, userId }: LeagueOptions = {}
  ) {
    // Get a sport ID;
    const { sportId, imageId } = createLeagueDto
    const league = new League()
    Object.assign(league, createLeagueDto)

    // Assign the league sport
    league.sport = new Sport()
    league.sport.id = sportId
    league.active_leaderboard = new Leaderboard()

    // Assign the supplied image
    league.image = new Image()
    league.image.id = imageId

    // Assign the owner if required (private leagues)
    if (userId) {
      league.owner = new User()
      league.owner.id = userId
    }

    // Assign the team if required (team leagues)
    if (teamId) {
      const team = await this.teamRepository.findOne(teamId, {
        relations: ['organisation']
      })
      if (!team)
        throw new NotFoundException(`The Team with ID ${teamId} does not exist`)
      league.team = team
      league.access = LeagueAccess.Team
      league.organisation = team.organisation

      // Assign the organisation if required (organisation leagues)
    } else if (organisationId) {
      const org = await this.organisationRepository.findOne({
        id: organisationId
      })
      if (!org)
        throw new NotFoundException(
          `The Organisation with ID ${organisationId} does not exist`
        )
      league.organisation = org
      league.access = LeagueAccess.Organisation
    }

    const createdLeague = await this.leaguesRepository.save(league)

    const leaderboard = await this.leaderboardRepository.save(
      this.leaderboardRepository.create({
        league: createdLeague
      })
    )

    await this.leaguesRepository
      .createQueryBuilder()
      .relation(League, 'active_leaderboard')
      .of(createdLeague)
      .set(leaderboard)

    league.active_leaderboard = leaderboard

    return league
  }

  async isOwnedBy(id: string, userId: string) {
    const result = await this.leaguesRepository.findOne({
      where: { id, owner: { id: userId } }
    })
    return !!result
  }

  async findOneOwnedByOrParticipatingIn(leagueId: string, userId: string) {
    return this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .leftJoin('league.owner', 'owner')
      .innerJoinAndSelect('league.active_leaderboard', 'leaderboard')
      .where('league.id = :leagueId', { leagueId })
      .andWhere('(user.id = :userId OR owner.id = :userId)', { userId })
      .getOne()
  }

  async findAll(
    where: FindOneOptions<League>['where'],
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] = await this.leaguesRepository.findAndCount({
      where,
      take: limit,
      skip: page * limit
    })
    return new Pagination<League>({
      results,
      total
    })
  }

  async findAllParticipating(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] = await this.leaguesRepository
      .createQueryBuilder('leagues')
      .innerJoinAndSelect('leagues.users', 'user')
      .where('user.id = :userId', { userId })
      .take(limit)
      .offset(page * limit)
      .getManyAndCount()

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

  async findOne(id: string, userId?: string) {
    const result = await this.leaguesRepository.findOne(id, {
      relations: ['active_leaderboard']
    })
    if (!result) {
      throw new NotFoundException(`League with ID ${id} not found`)
    }
    return result
  }

  async findManyAccessibleToUser(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] = await this.queryFindAccessibleToUser(userId)
      .take(limit)
      .skip(page * limit)
      .getManyAndCount()

    return new Pagination<League>({
      results,
      total
    })
  }

  async findOneAccessibleToUser(leagueId: string, userId: string) {
    const query = this.queryFindAccessibleToUser(userId)
    return await query.andWhere('league.id = :leagueId', { leagueId }).getOne()
  }

  /**
   * Builds a query which determines:
   * 1. Whether the user is the owner of the league
   * 2. Whether the league is public
   * 3. Whether the user is a participant in the league
   * 4. Whether the user belongs to the league's team (if assigned)
   * 5. Whether the user belongs to a team within the league's organisation (if assigned)
   *
   * This is used for fetching one and many leagues
   * for any user.
   *
   * @param userId
   * @returns
   */
  queryFindAccessibleToUser(userId: string) {
    return this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoinAndSelect('league.sport', 'sport')
      .leftJoinAndSelect('league.image', 'image')
      .leftJoinAndSelect('league.team', 'leagueTeam')
      .leftJoinAndSelect('league.active_leaderboard', 'leaderboard')
      .leftJoinAndSelect('league.organisation', 'leagueOrganisation')
      .leftJoinAndSelect('leagueTeam.avatar', 'leagueTeamAvatar')
      .leftJoinAndSelect(
        'leagueOrganisation.avatar',
        'leagueOrganisationAvatar'
      )
      .leftJoin('league.users', 'leagueUser')
      .leftJoin('leagueTeam.users', 'teamUser')
      .leftJoin('leagueOrganisation.teams', 'organisationTeam')
      .leftJoin('organisationTeam.users', 'organisationUser')

      .where(
        new Brackets((qb) => {
          // The league is public
          return (
            qb
              .where('league.access = :accessPublic')

              // The league is private & owned by the user
              .orWhere(
                '(league.access = :accessPrivate AND league.ownerId = :userId)'
              )

              // The league is private & user is a participant of the league
              .orWhere(
                `(league.access = :accessPrivate AND leagueUser.id = :userId)`
              )

              // The user belongs to the team that the league belongs to
              .orWhere(`(teamUser.id = :userId)`)

              // The user belongs to the organisation that the league belongs to
              .orWhere(`(organisationUser.id = :userId)`)
          )
        }),
        {
          accessPrivate: LeagueAccess.Private,
          accessPublic: LeagueAccess.Public,
          userId
        }
      )
      .orderBy('league.created_at', 'DESC')
  }

  async joinLeague(leagueId: string, userId: string) {
    const user = new User()
    user.id = userId

    const league = new League()
    league.id = leagueId

    await this.leaguesRepository
      .createQueryBuilder()
      .relation(League, 'users')
      .of(league)
      .add(user)

    const leaderboardEntry = await this.addLeaderboardEntry(leagueId, userId)

    return { success: true, league, leaderboardEntry }
  }

  async leaveLeague(leagueId: string, userId: string) {
    const user = new User()
    user.id = userId

    const league = new League()
    league.id = leagueId

    await this.leaguesRepository
      .createQueryBuilder()
      .relation(League, 'users')
      .of(league)
      .remove(user)

    await this.removeLeaderboardEntry(league.id, user.id)

    return { success: true }
  }

  async update(
    id: string,
    updateLeagueDto: UpdateLeagueDto,
    { teamId, organisationId }: LeagueOptions = {}
  ) {
    if (teamId) {
      return await this.leaguesRepository.update(id, {
        team: { id: teamId },
        ...updateLeagueDto
      })
    } else {
      // This Method supports partial updating since all undefined properties are skipped
      return await this.leaguesRepository.update(id, updateLeagueDto)
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

  /**
   * Find all entries of a league, with pagination options
   *
   * @param leaderboardId
   * @param options
   */
  async getLeaderboardMembers(
    leagueId: string,
    options: PaginationOptionsInterface
  ): Promise<Pagination<LeaderboardEntry & { user: UserPublic }>> {
    const query = this.leaderboardEntryRepository
      .createQueryBuilder('entry')
      .innerJoin('entry.leaderboard', 'entryLeaderboard')
      .innerJoin('entryLeaderboard.league', 'league')
      .innerJoin('league.active_leaderboard', 'leaderboard')
      .innerJoinAndSelect('entry.user', 'user')
      .leftJoinAndSelect('user.avatar', 'user.avatar')
      .where('league.id = :leagueId AND leaderboard.id = entryLeaderboard.id', {
        leagueId
      })
      .orderBy('entry.points', 'DESC')
      .addOrderBy('entry.updated_at', 'DESC')
      .take(options.limit)
      .skip(options.page * options.limit)

    const [results, total] = await query.getManyAndCount()

    return new Pagination<LeaderboardEntry & { user: UserPublic }>({
      results: results.map(this.getLeaguePublic),
      total
    })
  }

  /**
   * Gets the leaderboard rank and 2 flanking participants (above and below in ranking)
   *
   * TODO: Uses some legacy code from the previous (Firebase) build, and this can be improved
   * in future to be more optimized.
   *
   * @param userId
   * @param leagueId
   * @returns array of leaderboard entries
   */
  async getLeaderboardRankAndFlanks(leagueId: string, userId: string) {
    const league = await this.findOneOwnedByOrParticipatingIn(leagueId, userId)
    if (!league) {
      return false
    }

    const rank = await this.leaderboardEntriesService.findRankAndFlanksInLeaderboard(
      userId,
      league.active_leaderboard.id
    )

    const entries: LeaderboardEntry[] = []

    if (rank.flanks.prev) {
      entries.push(rank.flanks.prev)
    }

    if (rank.user) {
      entries.push(rank.user)
    }

    if (rank.flanks.next) {
      entries.push(rank.flanks.next)
    }

    const rankEntries = await this.leaderboardEntryRepository.findByIds(
      entries.map((entry) => entry.id),
      {
        relations: ['user', 'user.avatar']
      }
    )

    const results = entries.map((entry) => {
      const rankEntry = rankEntries.filter(
        (each) => each.user.id === entry.user_id
      )[0]
      return {
        ...rankEntry,
        rank: entry.rank,
        user: plainToClass(UserPublic, rankEntry.user, {
          excludeExtraneousValues: true
        })
      }
    })

    return { results }
  }

  getLeaguePublic(leaderboardEntry: LeaderboardEntry) {
    const user = plainToClass(UserPublic, leaderboardEntry.user, {
      excludeExtraneousValues: true
    })
    return {
      ...leaderboardEntry,
      user
    }
  }

  async addLeaderboardEntry(leagueId: string, userId: string) {
    const user = new User()
    user.id = userId
    const league = await this.findOne(leagueId)
    const entry = await this.leaderboardEntryRepository.save(
      this.leaderboardEntryRepository.create({
        leaderboard: league.active_leaderboard,
        leaderboard_id: league.active_leaderboard.id,
        league_id: leagueId,
        user_id: userId,
        user,
        wins: 0,
        points: 0
      })
    )
    return entry
  }

  async removeLeaderboardEntry(leagueId: string, userId: string) {
    const league = await this.findOne(leagueId)
    const result = await this.leaderboardEntryRepository.delete({
      leaderboard: { id: league.active_leaderboard.id },
      user: { id: userId }
    })
    return result
  }

  @OnEvent('queueable.league_started')
  processLeagueStartedEvent({
    payload,
    resolve,
    reject
  }: QueueableEventPayload) {
    if (payload.subject) {
      resolve()
    } else {
      reject('An error has occurred')
    }
  }
}
