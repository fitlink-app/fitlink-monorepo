import { HttpService, Injectable, NotFoundException } from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Brackets,
  FindOneOptions,
  getManager,
  LessThan,
  Not,
  Repository
} from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { QueueableEventPayload } from '../../models/queueable.model'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { Sport } from '../sports/entities/sport.entity'
import { Team } from '../teams/entities/team.entity'
import { Organisation } from '../organisations/entities/organisation.entity'
import { CreateLeagueDto } from './dto/create-league.dto'
import { UpdateLeagueDto } from './dto/update-league.dto'
import { League, LeaguePublic } from './entities/league.entity'
import { LeagueAccess } from './leagues.constants'
import { User, UserPublic } from '../users/entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { FeedItem } from '../feed-items/entities/feed-item.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { plainToClass } from 'class-transformer'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'
import { addDays } from 'date-fns'
import { CommonService } from '../common/services/common.service'
import { LeagueJoinedEvent } from './events/league-joined.event'
import { LeagueWonEvent } from './events/league-won.event'
import { Events } from '../../events'
import { ConfigService } from '@nestjs/config'
import { differenceInSeconds } from 'date-fns'

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

    private leaderboardEntriesService: LeaderboardEntriesService,
    private commonService: CommonService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  async create(
    createLeagueDto: CreateLeagueDto,
    { teamId, organisationId, userId }: LeagueOptions = {}
  ) {
    // Get a sport ID;
    const { sportId, imageId, ...rest } = createLeagueDto
    const league = new League()
    Object.assign(league, rest)

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

    // League starts immediately
    league.starts_at = new Date()

    // Set the end date based on duration
    // It will restart if `repeat` is set to true
    league.ends_at = addDays(new Date(), league.duration)

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

    // Join the user to the league if it was privately created
    if (league.access === LeagueAccess.Private) {
      await this.joinLeague(league.id, league.owner.id)
    }

    return league
  }

  async isOwnedBy(leagueId: string, userId: string) {
    const result = await this.leaguesRepository.findOne({
      where: { id: leagueId, owner: { id: userId } }
    })
    return !!result
  }

  async findOneOwnedByOrParticipatingIn(leagueId: string, userId: string) {
    return this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .leftJoinAndSelect('league.owner', 'owner')
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
      skip: page * limit,
      relations: ['image', 'sport']
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
    let { entities, raw } = await this.queryFindAccessibleToUser(userId)
      .where('leagueUser.id = :userId', { userId })
      .take(limit)
      .skip(page * limit)
      .getRawAndEntities()

    const [results, total] = this.applyRawResults(entities, raw)

    return new Pagination<LeaguePublic>({
      results: results.map((league) => this.getLeaguePublic(league, userId)),
      total
    })
  }

  async getAllLeaguesForTeam(
    id: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ): Promise<Pagination<League>> {
    const [results, total] = await this.leaguesRepository.findAndCount({
      where: {
        team: { id }
      },
      relations: ['image', 'sport'],
      take: limit,
      skip: page * limit
    })

    return new Pagination<League>({
      results,
      total
    })
  }

  async getAllLeaguesForOrganisation(
    id: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ): Promise<Pagination<League>> {
    const [results, total] = await this.leaguesRepository.findAndCount({
      where: {
        organisation: {
          id
        }
      },
      relations: ['image', 'sport'],
      take: limit,
      skip: page * limit
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
    let { entities, raw } = await this.queryFindAccessibleToUser(userId)
      .take(limit)
      .skip(page * limit)
      .getRawAndEntities()

    const [results, total] = this.applyRawResults(entities, raw)

    return new Pagination<LeaguePublic>({
      results: results.map((league) => this.getLeaguePublic(league, userId)),
      total
    })
  }

  applyRawResults(entities: League[], raw: any[]): [League[], number] {
    let total = 0
    const results = entities.map((league, index: number) => {
      total = raw[index].row_count
      return {
        ...league,
        rank: raw[index].rank
      }
    })

    return [results, total]
  }

  async searchManyAccessibleToUser(
    keyword: string,
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const { entities, raw } = await this.queryFindAccessibleToUser(userId)
      .andWhere(
        '(league.name ILIKE :keyword OR league.description ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .take(limit)
      .skip(page * limit)
      .getRawAndEntities()

    const [results, total] = this.applyRawResults(entities, raw)

    return new Pagination<LeaguePublic>({
      results: results.map((league) => this.getLeaguePublic(league, userId)),
      total
    })
  }

  getLeaguePublic(league: League, userId: string) {
    const leaguePublic = (league as unknown) as LeaguePublic
    leaguePublic.participating = Boolean(league.users.length > 0)
    leaguePublic.is_owner = Boolean(league.owner && league.owner.id === userId)
    leaguePublic.rank = Number(leaguePublic.rank) || null

    // Ensure personal user data of owner is sanitized.
    if (leaguePublic.owner) {
      ;((leaguePublic.owner as unknown) as UserPublic) = plainToClass(
        UserPublic,
        leaguePublic.owner,
        {
          excludeExtraneousValues: true
        }
      )
    }
    return leaguePublic
  }

  /**
   * Find a league the user can join
   * Alternatively, the owner of the league can also join
   * @param leagueId
   * @param userId
   * @returns
   */
  async findOneAccessibleToUser(leagueId: string, userId: string) {
    const query = this.queryFindAccessibleToUser(userId)
    const { entities, raw } = await query
      .andWhere('league.id = :leagueId', { leagueId })
      .getRawAndEntities()

    const [results] = this.applyRawResults(entities, raw)

    if (results[0]) {
      return this.getLeaguePublic(results[0], userId)
    } else {
      return results[0]
    }
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
    const rankQb = this.leaderboardEntryRepository
      .createQueryBuilder('entry')
      .select(
        'RANK() OVER (PARTITION BY entry.leaderboard.id ORDER BY entry.points DESC, entry.created_at DESC) AS rank, league.id AS leagueId, entry.user.id AS userId'
      )
      .leftJoin('entry.leaderboard', 'leaderboard')
      .leftJoin('leaderboard.league', 'league')
      .where('entry.leaderboard.id = leaderboard.id')
      .andWhere('league.active_leaderboard.id = leaderboard.id')

    return (
      this.leaguesRepository
        .createQueryBuilder('league')
        .leftJoinAndSelect('league.sport', 'sport')
        .leftJoinAndSelect('league.image', 'image')
        .leftJoinAndSelect('league.owner', 'owner')
        .leftJoinAndSelect('league.team', 'leagueTeam')
        .leftJoinAndSelect('league.active_leaderboard', 'leaderboard')
        .leftJoinAndSelect('league.organisation', 'leagueOrganisation')
        .leftJoinAndSelect('leagueTeam.avatar', 'leagueTeamAvatar')
        .leftJoinAndSelect(
          'leagueOrganisation.avatar',
          'leagueOrganisationAvatar'
        )
        .leftJoinAndSelect(
          'league.users',
          'leagueUser',
          'leagueUser.id = :userId',
          { userId }
        )
        .leftJoin('leagueTeam.users', 'teamUser')
        .leftJoin('leagueOrganisation.teams', 'organisationTeam')
        .leftJoin('organisationTeam.users', 'organisationUser')
        .leftJoin(
          `(${rankQb.getQuery()})`,
          'ranked',
          'ranked.leagueId = league.id AND ranked.userId = :userId',
          { userId }
        )
        .addSelect('ranked.rank AS rank')
        .addSelect('COUNT(*) OVER() AS row_count')

        .where(
          new Brackets((qb) => {
            // The league is public
            return (
              qb
                .where('league.access = :accessPublic')

                // The league is private & owned by the user
                .orWhere(
                  '(league.access = :accessPrivate AND owner.id = :userId)'
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

        // The league has not ended yet (or it repeats, in which case it's always visible)
        .andWhere('(league.repeat = true OR league.ends_at > :date)', {
          date: new Date()
        })
        .orderBy('league.created_at', 'DESC')
    )
  }

  async isParticipant(leagueId: string, userId: string) {
    const count = await this.leaguesRepository
      .createQueryBuilder('league')
      .innerJoin('league.users', 'user')
      .where('user.id = :userId AND league.id = :leagueId', {
        userId,
        leagueId
      })
      .getCount()

    return count > 0
  }

  /**
   * Uses a transaction to
   * 1. Join the league
   * 2. Add the new member's leaderboard entry to the active leaderboard
   * 3. Increments participants_total on league by 1
   * @param leagueId
   * @param userId
   * @returns
   */
  async joinLeague(leagueId: string, userId: string) {
    const user = new User()
    user.id = userId

    const league = new League()
    league.id = leagueId

    if (await this.isParticipant(leagueId, userId)) {
      return 'already joined'
    }

    const leaderboardEntry = await this.leaguesRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(League)
        const leaderboardEntryRepository = manager.getRepository(
          LeaderboardEntry
        )
        await repository
          .createQueryBuilder()
          .relation(League, 'users')
          .of(league)
          .add(user)

        const leaderboardEntry = await this.addLeaderboardEntry(
          leagueId,
          userId,
          leaderboardEntryRepository
        )
        await repository.increment({ id: leagueId }, 'participants_total', 1)
        return leaderboardEntry
      }
    )

    const event = new LeagueJoinedEvent()
    event.leagueId = leagueId
    event.userId = userId
    await this.eventEmitter.emitAsync(Events.LEAGUE_JOINED, event)
    return { success: true, league, leaderboardEntry }
  }

  /**
   * Uses a transaction to
   * 1. Leave the league
   * 2. Remove the member's leaderboard entry from the active leaderboard
   * 3. Decrements participants_total on league by 1
   * @param leagueId
   * @param userId
   * @returns
   */
  async leaveLeague(leagueId: string, userId: string) {
    const user = new User()
    user.id = userId

    const league = new League()
    league.id = leagueId

    await this.leaguesRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(League)
      const leaderboardEntryRepository = manager.getRepository(LeaderboardEntry)
      await repository
        .createQueryBuilder()
        .relation(League, 'users')
        .of(league)
        .remove(user)

      await this.removeLeaderboardEntry(
        leagueId,
        userId,
        leaderboardEntryRepository
      )
      await repository.decrement({ id: leagueId }, 'participants_total', 1)
    })

    return { success: true }
  }

  async update(
    id: string,
    updateLeagueDto: UpdateLeagueDto,
    { teamId, organisationId }: LeagueOptions = {}
  ) {
    const { imageId, sportId, ...rest } = updateLeagueDto
    const update: Partial<League> = { ...rest }

    if (sportId) {
      // Assign the sport
      update.sport = new Sport()
      update.sport.id = sportId
    }

    // Only the image is allowed to change
    if (imageId) {
      update.image = new Image()
      update.image.id = imageId
    }

    if (teamId) {
      return await this.leaguesRepository.update(id, {
        team: { id: teamId },
        ...update
      })
    } else {
      // This Method supports partial updating since all undefined properties are skipped
      return await this.leaguesRepository.update(id, update)
    }
  }

  async remove(id: string, team?: string) {
    let league: League
    if (team) {
      league = await this.leaguesRepository.findOne({
        where: {
          team,
          id
        }
      })
    } else {
      league = await this.leaguesRepository.findOne(id)
    }
    const result = await getManager().transaction(async (entityManager) => {
      const leaderboards = await entityManager.getRepository(Leaderboard).find({
        where: { league: { id: league.id } }
      })

      // Delete all leaderboard entries for each leaderboard
      await Promise.all(
        leaderboards.map((each) => {
          return entityManager.getRepository(LeaderboardEntry).delete({
            leaderboard: { id: each.id }
          })
        })
      )

      // Remove active leaderboard
      await entityManager
        .getRepository(League)
        .createQueryBuilder()
        .relation(League, 'active_leaderboard')
        .of(league)
        .set(null)

      // Delete leaderboards for league
      await entityManager.getRepository(Leaderboard).delete({
        league: { id: league.id }
      })

      // Delete feed items for league
      await entityManager.getRepository(FeedItem).delete({
        league: { id: league.id }
      })

      return entityManager.delete(League, league.id)
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
      .addOrderBy('user.name', 'ASC')
      .take(options.limit)
      .skip(options.page * options.limit)

    const [results, total] = await query.getManyAndCount()

    return new Pagination<LeaderboardEntry & { user: UserPublic }>({
      results: results.map(this.getLeaderboardEntryPublic),
      total
    })
  }

  /**
   * 1. User must not already be in the league
   * 2. If public, any user can be invited
   * 3. If team, only team members can be invited
   * 4. If org, only org members can be invited
   *
   * @param leagueId
   * @param options
   */
  async searchUsersWithJoinAccess(
    leagueId: string,
    userId: string,
    options: PaginationOptionsInterface,
    keyword: string = ''
  ): Promise<Pagination<UserPublic>> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.teams', 'userTeam')
      .leftJoin('user.avatar', 'avatar')
      .leftJoin('userTeam.organisation', 'userOrganisation')
      .leftJoin('league', 'league', 'league.id = :leagueId', { leagueId })
      .leftJoin('league.users', 'leagueUser', 'leagueUser.id = user.id')
      .leftJoin('user.leagues_invitations', 'i1')
      .leftJoinAndSelect(
        'user.leagues_invitations',
        'invitation',
        'i1.id = invitation.id AND invitation.from_user.id = :userId',
        { userId }
      )
      .leftJoin('user.following', 'f1')
      .leftJoin('user.followers', 'f2')
      .leftJoinAndSelect(
        'user.following',
        'following',
        'f1.id = following.id AND f1.follower.id = :userId',
        { userId }
      )
      .leftJoinAndSelect(
        'user.followers',
        'follower',
        'f2.id = follower.id AND f2.following.id = :userId',
        { userId }
      )
      .where(
        new Brackets((qb) => {
          // The league is public
          return (
            qb

              // Where it is a public league, only show friends
              .where(
                '(league.access = :accessPublic AND following.id IS NOT NULL)'
              )

              // Where it is a private league, only show friends
              .orWhere(
                '(league.access = :accessPrivate AND following.id IS NOT NULL)'
              )

              // The league is 'team'
              // The user belongs to the team that the league belongs to
              // Show any user within that team
              .orWhere(
                '(league.access = :accessTeam AND league.team.id = userTeam.id)'
              )

              // The league is 'organisation'
              // The user belongs to the organisation that the league belongs to
              // Show any user within that organisation
              .orWhere(
                '(league.access = :accessOrganisation AND userOrganisation.id = league.organisation.id)'
              )
          )
        }),
        {
          accessPrivate: LeagueAccess.Private,
          accessTeam: LeagueAccess.Team,
          accessPublic: LeagueAccess.Public,
          accessOrganisation: LeagueAccess.Organisation,
          userId
        }
      )
      // The user is not already a member of the league
      .andWhere('leagueUser.id IS NULL')
      .take(options.limit)
      .skip(options.page * options.limit)

    // Precision email search
    if (keyword.indexOf('@') > 0) {
      query = query.andWhere('user.email = :keyword', { keyword })
    } else if (keyword) {
      query = query.andWhere('user.name ILIKE :keyword', {
        keyword: `%${keyword}%`
      })
    }

    const [results, total] = await query.getManyAndCount()

    return new Pagination<UserPublic>({
      results: results.map((user) => this.commonService.getUserPublic(user)),
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

  getLeaderboardEntryPublic(leaderboardEntry: LeaderboardEntry) {
    const user = plainToClass(UserPublic, leaderboardEntry.user, {
      excludeExtraneousValues: true
    })
    return {
      ...leaderboardEntry,
      user
    }
  }

  async addLeaderboardEntry(
    leagueId: string,
    userId: string,
    repository: Repository<LeaderboardEntry>
  ) {
    const user = new User()
    user.id = userId
    const league = await this.findOne(leagueId)
    const entry = await repository.save(
      repository.create({
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

  async removeLeaderboardEntry(
    leagueId: string,
    userId: string,
    repository: Repository<LeaderboardEntry>
  ) {
    const league = await this.findOne(leagueId)
    const result = await repository.delete({
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

  // calculate the winners of the league
  async calculateLeagueWinners(leagueId: string) {
    const league = await this.leaguesRepository.findOne(leagueId, {
      relations: ['active_leaderboard', 'users']
    })
    const entries = (
      await this.leaderboardEntriesService
        .queryLeaderboardRank(league.active_leaderboard.id)
        .getRawMany()
    ).map((entry) => {
      entry.user = new User()
      entry.user.id = entry.userId
      return entry as LeaderboardEntry
    })

    const winners = entries.filter((entry) => entry.rank === '1')
    return { winners }
  }

  async emitWinnerFeedItems(leagueId: string, winners: LeaderboardEntry[]) {
    if (winners.length > 0) {
      await Promise.all(
        winners.map((w) => {
          const event = new LeagueWonEvent()
          event.leagueId = leagueId
          event.userId = w.user_id
          return this.eventEmitter.emitAsync('league.won', event)
        })
      )
    }
  }

  async resetLeague(league: League) {
    // If the league repeats, create a new leaderboard
    // and copy the users to it along with their wins
    if (league.repeat && league.active_leaderboard) {
      const { winners } = await this.calculateLeagueWinners(league.id)
      const leaderboard = await this.leaderboardRepository.save(
        this.leaderboardRepository.create({
          league: league
        })
      )

      await this.leaguesRepository.manager.transaction(async (manager) => {
        const repo = manager.getRepository(LeaderboardEntry)
        const leagueRepo = manager.getRepository(League)
        const leaderboardRepo = manager.getRepository(Leaderboard)
        await Promise.all(
          league.users.map((leagueUser) => {
            const winner = winners.filter((e) => leagueUser.id === e.user.id)[0]
            return repo.save(
              repo.create({
                leaderboard,
                leaderboard_id: leaderboard.id,
                league_id: league.id,
                wins: winner ? winner.wins + 1 : 0
              })
            )
          })
        )

        await leaderboardRepo.update(league.active_leaderboard, {
          completed: true
        })

        await leagueRepo.update(league, {
          active_leaderboard: leaderboard,
          ends_at: addDays(new Date(), league.duration)
        })
      })

      await this.emitWinnerFeedItems(league.id, winners)
      return {
        winners: winners.length,
        users: league.users.length,
        restarted: true
      }
    } else if (league.active_leaderboard) {
      const { winners } = await this.calculateLeagueWinners(league.id)

      await this.leaguesRepository.manager.transaction(async (manager) => {
        const repo = manager.getRepository(LeaderboardEntry)
        const leagueRepo = manager.getRepository(League)
        const leaderboardRepo = manager.getRepository(Leaderboard)
        await Promise.all(
          winners.map((winner) => {
            return repo.save({
              ...winner,
              wins: winner.wins + 1
            })
          })
        )

        await leaderboardRepo.update(league.active_leaderboard, {
          completed: true
        })

        await leagueRepo.update(league, {
          active_leaderboard: null
        })
      })

      await this.emitWinnerFeedItems(league.id, winners)
      return {
        winners: winners.length,
        users: league.users.length,
        restarted: false
      }
    }

    return false
  }

  /**
   * Process leagues that are due to be ended / restarted
   */
  async processPendingLeagues() {
    const started = new Date()
    const leagues = await this.leaguesRepository
      .createQueryBuilder('league')
      .innerJoinAndSelect('league.active_leaderboard', 'active_leaderboard')
      .leftJoinAndSelect('league.users', 'users')
      .where('league.ends_at <= :date', { date: new Date() })
      .andWhere('active_leaderboard.completed = false')
      .limit(100)
      .getMany()

    const results = await Promise.all(
      leagues.map((league) => this.resetLeague(league))
    )
    const totalLeagues = results.map((e) => e !== false).length
    const leaguesRestarted = results.map((e) => e && e.restarted).length
    const result = {
      leagues_processed: totalLeagues,
      leagues_restarted: leaguesRestarted
    }

    await this.notifySlack(differenceInSeconds(new Date(), started), result)
    return result
  }

  async notifySlack(seconds: number, result: NodeJS.Dict<any>) {
    try {
      await this.httpService
        .post(this.configService.get('SLACK_WEBHOOK_JOBS_URL'), {
          text: `Leagues job took ${seconds} seconds to run`,
          attachments: { text: JSON.stringify(result) }
        })
        .toPromise()
    } catch (e) {
      console.error(e)
    }
  }
}
