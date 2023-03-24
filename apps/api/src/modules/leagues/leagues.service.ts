import {
  BadRequestException,
  HttpService,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Brackets,
  FindOneOptions,
  getManager,
  LessThan,
  MoreThan,
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
import {
  League,
  LeaguePublic,
  LeagueWithDailyBfit
} from './entities/league.entity'
import { LeagueAccess } from './leagues.constants'
import { User, UserPublic } from '../users/entities/user.entity'
import { Image } from '../images/entities/image.entity'
import { FeedItem } from '../feed-items/entities/feed-item.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { plainToClass } from 'class-transformer'
import { LeaderboardEntriesService } from '../leaderboard-entries/leaderboard-entries.service'
import { addDays, addHours } from 'date-fns'
import { CommonService } from '../common/services/common.service'
import { LeagueJoinedEvent } from './events/league-joined.event'
import { LeagueWonEvent } from './events/league-won.event'
import { Events } from '../../events'
import { differenceInMilliseconds } from 'date-fns'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationAction } from '../notifications/notifications.constants'
import { LeaguesInvitation } from '../leagues-invitations/entities/leagues-invitation.entity'
import { LeagueBfitClaim } from './entities/bfit-claim.entity'
import { ClaimLeagueBfitDto } from './dto/claim-league-bfit.dto'
import { LeagueFilter } from 'apps/api-sdk/types'
import { LeagueBfitEarnings } from './entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { WalletTransactionSource } from '../wallet-transactions/wallet-transactions.constants'
import { FilterCompeteToEarnDto } from './dto/filter-compete-to-earn.dto'
import { registry, msg } from 'kujira.js'
import { GasPrice, SigningStargateClient, coins } from '@cosmjs/stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import { LeagueWaitlistUser } from './entities/league-waitlist-user.entity'
import { getBfitEarning } from '../../helpers/bfit-helpers'

type LeagueOptions = {
  teamId?: string
  organisationId?: string
  userId?: string
}

type PublicPageLeague = {
  photo_url: string
  description: string
  title: string
  sport: Sport
  repeat: boolean
  participants_total: number
  duration: number
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

    @InjectRepository(LeagueBfitClaim)
    private leagueBfitClaimRepository: Repository<LeagueBfitClaim>,

    @InjectRepository(LeagueBfitEarnings)
    private LeagueBfitEarningsRepository: Repository<LeagueBfitEarnings>,

    @InjectRepository(Team)
    private teamRepository: Repository<Team>,

    @InjectRepository(Organisation)
    private organisationRepository: Repository<Organisation>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(LeagueWaitlistUser)
    private leagueWaitlistUserRepository: Repository<LeagueWaitlistUser>,

    @InjectRepository(LeagueBfitEarnings)
    private leagueBfitEarningsRepository: Repository<LeagueBfitEarnings>,

    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,

    private leaderboardEntriesService: LeaderboardEntriesService,
    private commonService: CommonService,
    private eventEmitter: EventEmitter2,
    private notificationsService: NotificationsService
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
      league.access =
        league.access === LeagueAccess.CompeteToEarn
          ? league.access
          : LeagueAccess.Team
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

  async claimLeagueBfit(
    leagueId: string,
    userId: string,
    claimLeagueBfitDto: ClaimLeagueBfitDto
  ) {
    if (claimLeagueBfitDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero')
    }
    const league = await this.leaguesRepository.findOne(leagueId, {
      relations: ['active_leaderboard']
    })
    if (!league) {
      throw new NotFoundException(`League with ID ${leagueId} not found`)
    }

    const leaderboardEntry = await this.leaderboardEntryRepository.findOne({
      leaderboard: { id: league.active_leaderboard.id },
      user: { id: userId }
    })
    if (!leaderboardEntry) {
      throw new NotFoundException('Leaderboard entry not found')
    }

    if (league.access !== LeagueAccess.CompeteToEarn) {
      throw new BadRequestException(
        'The provided league is not a compete to ear league'
      )
    }
    const claimableBfit =
      leaderboardEntry.bfit_earned - leaderboardEntry.bfit_claimed
    if (claimableBfit < claimLeagueBfitDto.amount) {
      throw new BadRequestException(
        `You have not earned enough bfit in this league to claim ${
          claimLeagueBfitDto.amount / 1000_000
        } BFIT`
      )
    }
    let createdClaim: LeagueBfitClaim
    await this.leagueBfitClaimRepository.manager.transaction(
      async (manager) => {
        const leagueBfitClaimRepo = manager.getRepository(LeagueBfitClaim)
        const leaderboardEntryRepo = manager.getRepository(LeaderboardEntry)
        const userRepo = manager.getRepository(User)
        const walletTransactionRepo = manager.getRepository(WalletTransaction)

        const leagueBfitClaim = new LeagueBfitClaim()
        leagueBfitClaim.league_id = leagueId
        leagueBfitClaim.user_id = userId
        leagueBfitClaim.bfit_amount = claimLeagueBfitDto.amount
        createdClaim = await leagueBfitClaimRepo.save(leagueBfitClaim)

        // update claimed bfit in this user's leaderboard entry
        await leaderboardEntryRepo.increment(
          {
            leaderboard: { id: league.active_leaderboard.id },
            user: { id: userId }
          },

          'bfit_claimed',
          claimLeagueBfitDto.amount
        )

        // update user bfit balance
        await userRepo.increment(
          {
            id: userId
          },

          'bfit_balance',
          claimLeagueBfitDto.amount
        )

        const transactionHash = await this.sendBfitClaimTransaction(
          leagueId,
          userId,
          claimLeagueBfitDto.amount
        )

        let walletTransaction = new WalletTransaction()
        walletTransaction.source = WalletTransactionSource.LeagueBfitClaim
        walletTransaction.claim_id = createdClaim.id
        walletTransaction.league_id = league.id
        walletTransaction.league_name = league.name
        walletTransaction.user_id = userId
        walletTransaction.bfit_amount = claimLeagueBfitDto.amount
        walletTransaction.bfit_amount = claimLeagueBfitDto.amount
        walletTransaction.transaction_id = transactionHash
        await walletTransactionRepo.save(walletTransaction)
      }
    )
    return createdClaim
  }

  async incrementUserBfit(email: string, amount: number) {
    const user = await this.userRepository.findOne({ email })
    if (!user) {
      throw new NotFoundException('User with the provided email not found')
    }

    const incremented = await this.userRepository.increment(
      {
        id: user.id
      },

      'bfit_balance',
      amount * 1000_000
    )
    return incremented
  }

  async getUserBfitClaims(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    let where = { user_id: userId }
    const [results, total] = await this.leagueBfitClaimRepository.findAndCount({
      where,
      take: limit,
      skip: page * limit
    })
    return new Pagination<LeagueBfitClaim>({
      results,
      total
    })
  }

  async getUserBfitEarningsHistory(
    userId: string,
    { limit = 7, page = 0 }: PaginationOptionsInterface
  ) {
    // if limit is greater than or equal to 13 include previous week results
    let startDate = new Date(Date.now() - limit * 24 * 60 * 60 * 1000)
    let where = { user_id: userId, created_at: MoreThan(startDate) }
    const query = this.LeagueBfitEarningsRepository.createQueryBuilder()
      .select("DATE_TRUNC('day', created_at) as day")
      .addSelect('CAST(SUM(bfit_amount) AS FLOAT)', 'bfit_amount')
      .addSelect('user_id')
      .addSelect('array_agg(DISTINCT league_id)', 'league_ids')
      .where(where)
      .groupBy('day')
      .addGroupBy('user_id')
      .orderBy('day', 'ASC')
    // .take(limit)
    // .skip(page * limit)
    let results = await query.getRawMany()

    const dateStrings = Array.from({ length: limit }, (_, i) => {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      return date.toISOString().substring(0, 10)
    })
    const newResults = dateStrings.map((datestring) => {
      const match = results.find((r) => {
        return r.day.toISOString().includes(datestring)
      })
      if (match) {
        return match
      }
      const newRecord = {
        day: new Date(datestring).toISOString(),
        bfit_amount: 0,
        user_id: userId,
        league_ids: []
      }
      return newRecord
    })
    const total = newResults.length
    return new Pagination<LeagueBfitEarnings>({
      results: newResults,
      total
    })
  }

  // TODO(BFIT): We should remove this function and all calls to it
  async getUserTotalLeagueDailyBfitEarnings(leagueId: string) {
    const today = new Date()
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )

    const query = this.LeagueBfitEarningsRepository.createQueryBuilder('lbe')
      .select('SUM(lbe.bfit_amount)', 'total')
      .where('lbe.league_id = :leagueId', { leagueId })
      .andWhere('lbe.created_at >= :startDate', { startDate })

    const result = await query.getRawOne()
    let total = result.total ? Number(result.total) : 0
    return { total }
  }

  async getTotalUsersPointsForLeagueToday(leagueId: string): Promise<string> {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0))
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999))
    return await this.leaguesRepository
      .createQueryBuilder('league')
      .innerJoin('league.users', 'user')
      .innerJoin('user.health_activities', 'health_activity')
      .select('SUM(health_activity.points)', 'totalPoints')
      .where('league.id = :leagueId', { leagueId })
      .andWhere('health_activity.start_time >= :startOfDay', { startOfDay })
      .andWhere('health_activity.start_time <= :endOfDay', { endOfDay })
      .getRawOne()
      .then((grandTotal) => grandTotal.totalPoints || 0)
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

  async findAllCompeteToEarnLeagues(
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    userId: string,
    query: FilterCompeteToEarnDto
  ) {
    let results: League[]
    let total: number
    if (Object.keys(query).length && query.isParticipating) {
      const query = this.queryFindAccessibleToUser(userId)
        .andWhere(
          'leagueUser.id = :userId AND league.access = :access AND (league.team IS NOT NULL AND teamUser.id = :userId)',
          {
            access: LeagueAccess.CompeteToEarn,
            userId
          }
        )
        .orWhere(
          'leagueUser.id = :userId AND league.access = :access AND (league.team IS NULL)',
          {
            access: LeagueAccess.CompeteToEarn,
            userId
          }
        )
        .take(limit)
        .skip(page * limit)

      const { entities, raw } = await query.getRawAndEntities()
      results = this.applyRawResults(entities, raw)
      total = await query.limit(0).getCount()
    } else if (Object.keys(query).length && !query.isParticipating) {
      const where = this.leaguesRepository
        .createQueryBuilder('league')
        .select('league.id')
        .innerJoin('league.users', 'user')
        .where('user.id = :userId', { userId })

      const query = this.queryFindAccessibleToUser(userId)
        .leftJoinAndSelect('league.users', 'user')
        .andWhere(
          `league.id NOT IN (${where.getQuery()}) AND league.access = :access AND (league.team IS NOT NULL AND teamUser.id = :userId)`,
          {
            access: LeagueAccess.CompeteToEarn,
            userId
          }
        )
        .orWhere(
          `league.id NOT IN (${where.getQuery()}) AND league.access = :access AND (league.team IS NULL)`,
          {
            access: LeagueAccess.CompeteToEarn
          }
        )
        .take(limit)
        .skip(page * limit)

      let { entities, raw } = await query.getRawAndEntities()
      total = await query.limit(0).getCount()
      results = this.applyRawResults(entities, raw)
    } else {
      const query = this.queryFindAccessibleToUser(userId)
        .andWhere(
          'league.access = :access AND (league.team IS NOT NULL AND teamUser.id = :userId)',
          {
            access: LeagueAccess.CompeteToEarn,
            userId
          }
        )
        .orWhere('league.access = :access AND (league.team IS NULL)', {
          access: LeagueAccess.CompeteToEarn
        })
        .take(limit)
        .skip(page * limit)

      const { entities, raw } = await query.getRawAndEntities()
      results = this.applyRawResults(entities, raw)
      total = await query.limit(0).getCount()
    }

    let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .where('league.access = :access', {
        access: LeagueAccess.CompeteToEarn
      })
      .select('COUNT(user.id)', 'totalUsers')
      .getRawOne()

    totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers

    const promises = results.map(async (league) => {
      const leagueObject: LeagueWithDailyBfit = { ...league }

      const leagueUsers = league.participants_total
      // we multiply by 1000000 because BFIT has 6 decimals
      const dailyBfit = Math.round(
        (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
      )
      leagueObject.daily_bfit = dailyBfit
      const todaysBfitDistribution =
        await this.getUserTotalLeagueDailyBfitEarnings(league.id)
      leagueObject.bfit_distributed_today = Math.round(
        todaysBfitDistribution.total / 1000000
      )
      return leagueObject
    })
    const leaguesWithDailyBfit = await Promise.all(promises)
    return new Pagination<LeagueWithDailyBfit>({
      results: leaguesWithDailyBfit,
      total
    })
  }

  async findLeagueDailyBfit(id: string) {
    const league = await this.leaguesRepository.findOne(id, {
      relations: ['active_leaderboard', 'users']
    })
    if (!league) {
      throw new NotFoundException(`League with ID ${id} not found`)
    }

    let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .where('league.access = :access', {
        access: LeagueAccess.CompeteToEarn
      })
      .select('COUNT(user.id)', 'totalUsers')
      .getRawOne()

    totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers
    const leagueObject: LeagueWithDailyBfit = { ...league }

    const leagueUsers = league.participants_total
    const dailyBfit = Math.round(
      (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
    )
    leagueObject.daily_bfit = dailyBfit

    const todaysBfitDistribution =
      await this.getUserTotalLeagueDailyBfitEarnings(league.id)
    leagueObject.bfit_distributed_today = Math.round(
      todaysBfitDistribution.total / 1000000
    )
    return leagueObject
  }

  async findAllParticipating(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const query = this.queryFindAccessibleToUser(userId)
      .where('leagueUser.id = :userId', { userId })
      .take(limit)
      .skip(page * limit)

    const { entities, raw } = await query.getRawAndEntities()
    const results = this.applyRawResults(entities, raw)

    let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .where('league.access = :access', {
        access: LeagueAccess.CompeteToEarn
      })
      .select('COUNT(user.id)', 'totalUsers')
      .getRawOne()

    totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers
    const promises = results.map(async (league) => {
      if (league.access === LeagueAccess.CompeteToEarn) {
        const leagueObject: LeagueWithDailyBfit = { ...league }
        const leagueUsers = league.participants_total
        const dailyBfit = Math.round(
          (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
        )
        leagueObject.daily_bfit = dailyBfit

        const todaysBfitDistribution =
          await this.getUserTotalLeagueDailyBfitEarnings(league.id)
        leagueObject.bfit_distributed_today = Math.round(
          todaysBfitDistribution.total / 1000000
        )
        return leagueObject
      }
      return league
    })
    const leaguesWithDailyBfit = await Promise.all(promises)
    const total = await query.limit(0).getCount()

    return new Pagination<LeaguePublic>({
      results: leaguesWithDailyBfit.map((league) =>
        this.getLeaguePublic(league, userId)
      ),
      total
    })
  }

  async findAllNotParticipating(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    leagueFilters: LeagueFilter = {}
  ) {
    // Use a subquery inside a where statement to determine
    // leagues that the user does not yet belong to.
    const where = this.leaguesRepository
      .createQueryBuilder('league')
      .select('league.id')
      .innerJoin('league.users', 'user')
      .where('user.id = :userId', { userId })

    const query = this.queryFindAccessibleToUser(userId, leagueFilters)
      .andWhere(`league.id NOT IN (${where.getQuery()})`)
      .take(limit)
      .skip(page * limit)

    let { entities, raw } = await query.getRawAndEntities()
    const total = await query.limit(0).getCount()
    const results = this.applyRawResults(entities, raw)

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

    if (result.access === LeagueAccess.CompeteToEarn) {
      const leagueObject: LeagueWithDailyBfit = { ...result }
      let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
        .createQueryBuilder('league')
        .leftJoin('league.users', 'user')
        .where('league.access = :access', {
          access: LeagueAccess.CompeteToEarn
        })
        .select('COUNT(user.id)', 'totalUsers')
        .getRawOne()

      totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers

      const leagueUsers = result.participants_total
      const dailyBfit = Math.round(
        (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
      )
      leagueObject.daily_bfit = dailyBfit

      const todaysBfitDistribution =
        await this.getUserTotalLeagueDailyBfitEarnings(result.id)
      leagueObject.bfit_distributed_today = Math.round(
        todaysBfitDistribution.total / 1000000
      )
      return leagueObject
    }
    return result
  }

  async findManyAccessibleToUser(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const query = this.queryFindAccessibleToUser(userId)
      .take(limit)
      .skip(page * limit)

    let { entities, raw } = await query.getRawAndEntities()
    const total = await query.limit(0).getCount()
    const results = this.applyRawResults(entities, raw)

    return new Pagination<LeaguePublic>({
      results: results.map((league) => this.getLeaguePublic(league, userId)),
      total
    })
  }

  applyRawResults(entities: League[], raw: any[]): League[] {
    const filter = []
    raw.forEach((each) => {
      if (!filter.filter((e) => e.league_id === each.league_id).length) {
        filter.push(each)
      }
    })

    const results = entities.map((league, index: number) => {
      return {
        ...league,
        rank: Number(filter[index].rank) || 0
      }
    })

    return results
  }

  async searchManyAccessibleToUser(
    keyword: string,
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface,
    leagueFilters: LeagueFilter = {}
  ) {
    const query = this.queryFindAccessibleToUser(userId, leagueFilters)
      .andWhere(
        '(league.name ILIKE :keyword OR league.description ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .take(limit)
      .skip(page * limit)

    const { entities, raw } = await query.getRawAndEntities()
    const results = this.applyRawResults(entities, raw)
    const total = await query.limit(0).getCount()

    return new Pagination<LeaguePublic>({
      results: results.map((league) => this.getLeaguePublic(league, userId)),
      total
    })
  }

  getLeaguePublic(league: League | LeaguePublic, userId: string) {
    const leaguePublic = league as unknown as LeaguePublic
    leaguePublic.participating = Boolean(league.users.length > 0)
    leaguePublic.is_owner = Boolean(league.owner && league.owner.id === userId)
    leaguePublic.rank = Number(leaguePublic.rank) || null
    leaguePublic.users = league.users.map((e) =>
      this.commonService.getUserPublic(e)
    )

    if (!leaguePublic.participating) {
      leaguePublic.rank = null
    }

    if (leaguePublic.daily_bfit) {
      leaguePublic.daily_bfit = leaguePublic.daily_bfit
    }

    if (leaguePublic.bfit_distributed_today) {
      leaguePublic.bfit_distributed_today = leaguePublic.bfit_distributed_today
    }

    // Ensure personal user data of owner is sanitized.
    if (leaguePublic.owner) {
      ;(leaguePublic.owner as unknown as UserPublic) = plainToClass(
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
    let query = this.queryFindAccessibleToUser(userId)
    query = query.andWhere('league.id = :leagueId', { leagueId })

    const { entities, raw } = await query.getRawAndEntities()

    const results = this.applyRawResults(entities, raw)

    if (results[0]) {
      const leagueObject: LeagueWithDailyBfit = { ...results[0] }
      if (results[0].access === LeagueAccess.CompeteToEarn) {
        let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
          .createQueryBuilder('league')
          .leftJoin('league.users', 'user')
          .where('league.access = :access', {
            access: LeagueAccess.CompeteToEarn
          })
          .select('COUNT(user.id)', 'totalUsers')
          .getRawOne()

        totalCompeteToEarnLeaguesUsers =
          totalCompeteToEarnLeaguesUsers.totalUsers

        const leagueUsers = results[0].participants_total
        const dailyBfit = Math.round(
          (leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
        )
        leagueObject.daily_bfit = dailyBfit

        const todaysBfitDistribution =
          await this.getUserTotalLeagueDailyBfitEarnings(results[0].id)
        leagueObject.bfit_distributed_today = Math.round(
          todaysBfitDistribution.total / 1000000
        )
      }
      return this.getLeaguePublic(leagueObject, userId)
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
  queryFindAccessibleToUser(
    userId: string,
    {
      isCte = true,
      isOrganization = true,
      isPrivate = true,
      isPublic = true,
      isTeam = true
    }: LeagueFilter = {}
  ) {
    const rankQb = this.leaderboardEntryRepository
      .createQueryBuilder('entry')
      .select(
        'RANK() OVER (PARTITION BY entry.leaderboard.id ORDER BY entry.points DESC) AS rank, league.id AS leagueId, entry.user.id AS userId'
      )
      .innerJoin('entry.leaderboard', 'leaderboard')
      .innerJoin('leaderboard.league', 'league')
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
        // .leftJoin('leagueOrganisation.teams', 'organisationTeam')
        // .leftJoin('organisationTeam.users', 'organisationUser')
        .leftJoin(
          `(${rankQb.getQuery()})`,
          'ranked',
          'ranked.leagueId = league.id AND ranked.userId = :userId',
          { userId }
        )
        .addSelect('ranked.*')

        .where(
          new Brackets((qb) => {
            let filteredQb = qb

            // The league is public
            if (isPublic) {
              filteredQb = filteredQb.where('league.access = :accessPublic')
            }

            // the league is a compete to earn league
            if (isCte) {
              filteredQb = filteredQb.orWhere(
                'league.access = :accessCompeteToEarn'
              )
            }
            // The league is private
            if (isPrivate) {
              filteredQb = filteredQb
                // The league is private & owned by the user
                .orWhere(
                  '(league.access = :accessPrivate AND owner.id = :userId)'
                )

                // The league is private & user is a participant of the league
                .orWhere(
                  `(league.access = :accessPrivate AND leagueUser.id = :userId)`
                )
            }

            // The user belongs to the team that the league belongs to
            if (isTeam) {
              filteredQb = filteredQb.orWhere(`(teamUser.id = :userId)`)
            }

            // The user belongs to the organisation that the league belongs to
            // if (isOrganization) {
            //   filteredQb = filteredQb.orWhere(`(organisationUser.id = :userId)`)
            // }
            return filteredQb
          }),
          {
            accessPrivate: LeagueAccess.Private,
            accessPublic: LeagueAccess.Public,
            accessCompeteToEarn: LeagueAccess.CompeteToEarn,
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

  // adds a user to a league waitlist
  async joinLeagueWaitlist(leagueId: string, userId: string) {
    const user = new User()
    user.id = userId

    const league = new League()
    league.id = leagueId

    const waitlistUser = await this.leagueWaitlistUserRepository.findOne({
      where: {
        league_id: leagueId,
        user_id: userId
      }
    })
    if (waitlistUser) {
      throw new BadRequestException(
        "You have already joined this league's waitlist"
      )
    }
    if (await this.isParticipant(leagueId, userId)) {
      throw new BadRequestException('You have already joined this league')
    }

    let isCompeteToEarn = await this.leaguesRepository.findOne(
      {
        id: leagueId,
        access: LeagueAccess.CompeteToEarn
      },
      {
        relations: ['sport']
      }
    )
    // check if the user has already joined more than 3 leagues
    if (isCompeteToEarn) {
      // check if the user has joined the maximum number of c2e leagues with the same sport id,
      // it should be a maximum of 3
      const sameSportCount = await this.leaguesRepository
        .createQueryBuilder('league')
        .innerJoin('league.users', 'user')
        .innerJoin('league.sport', 'sport')
        .where(
          'user.id = :userId AND sport.id = :sportId AND access = :leagueAccess',
          {
            userId,
            leagueId,
            sportId: isCompeteToEarn?.sport?.id,
            leagueAccess: LeagueAccess.CompeteToEarn
          }
        )
        .getCount()
      if (sameSportCount >= 1) {
        throw new BadRequestException(
          'You can only join one sport type of a compete to earn league i.e. 1 x swim, 1 x cycle and 1 run'
        )
      }

      let query = this.queryFindAccessibleToUser(userId, {
        isCte: true,
        isOrganization: false,
        isPrivate: false,
        isPublic: false,
        isTeam: false
      })

      query = query.andWhere('leagueUser.id = :userId', { userId })
      const { entities, raw } = await query.getRawAndEntities()
      const results = this.applyRawResults(entities, raw)
      if (results.length >= 3) {
        throw new BadRequestException(
          'You can only join a maximum of 3 compete to earn leagues'
        )
      }
    }

    const leagueWaitlistUser = new LeagueWaitlistUser()
    leagueWaitlistUser.league_id = leagueId
    leagueWaitlistUser.user_id = userId
    await this.leagueWaitlistUserRepository.save(leagueWaitlistUser)

    return { success: true, league }
  }

  // finds league waitlist users with the provided user id
  async findUserLeagueWaitlists(
    userId: string,
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    let where = { user_id: userId }
    const [results, total] =
      await this.leagueWaitlistUserRepository.findAndCount({
        where,
        take: limit,
        skip: page * limit
      })
    return new Pagination<LeagueWaitlistUser>({
      results,
      total
    })
  }

  // adds waitlist users to a league
  async joinLeagueFromWaitlist(leagueId: string, userId: string) {
    const waitlistUser = await this.leagueWaitlistUserRepository.findOne({
      where: {
        league_id: leagueId,
        user_id: userId
      }
    })
    if (!waitlistUser) {
      console.error(
        `Waitlist user with league id ${leagueId} and user id ${userId} not found`
      )
      return
    }
    const user = new User()
    user.id = userId

    const league = new League()
    league.id = leagueId

    const leaderboardEntry = await this.leaguesRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(League)
        const leaderboardEntryRepository =
          manager.getRepository(LeaderboardEntry)
        const invitationRepository = manager.getRepository(LeaguesInvitation)
        const userRepository = manager.getRepository(User)
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

        // Update the invitation to accepted
        await invitationRepository.update(
          {
            to_user: {
              id: userId
            },
            league: {
              id: leagueId
            }
          },
          {
            accepted: true
          }
        )

        // Update the user's total unread invitation count
        await userRepository.update(
          {
            id: userId
          },
          {
            league_invitations_total: await invitationRepository.count({
              to_user: { id: userId },
              dismissed: false,
              accepted: false
            })
          }
        )

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
      throw new BadRequestException('You have already joined this league')
    }

    let isCompeteToEarn = await this.leaguesRepository.findOne(
      {
        id: leagueId,
        access: LeagueAccess.CompeteToEarn
      },
      {
        relations: ['sport']
      }
    )
    // check if the user has already joined more than 3 leagues
    if (isCompeteToEarn) {
      // check if the user has joined the maximum number of c2e leagues with the same sport id,
      // it should be a maximum of 3
      const sameSportCount = await this.leaguesRepository
        .createQueryBuilder('league')
        .innerJoin('league.users', 'user')
        .innerJoin('league.sport', 'sport')
        .where(
          'user.id = :userId AND sport.id = :sportId AND access = :leagueAccess',
          {
            userId,
            leagueId,
            sportId: isCompeteToEarn?.sport?.id,
            leagueAccess: LeagueAccess.CompeteToEarn
          }
        )
        .getCount()
      if (sameSportCount >= 1) {
        throw new BadRequestException(
          'You can only join one sport type of a compete to earn league i.e. 1 x swim, 1 x cycle and 1 run'
        )
      }

      let query = this.queryFindAccessibleToUser(userId, {
        isCte: true,
        isOrganization: false,
        isPrivate: false,
        isPublic: false,
        isTeam: false
      })

      query = query.andWhere('leagueUser.id = :userId', { userId })
      const { entities, raw } = await query.getRawAndEntities()
      const results = this.applyRawResults(entities, raw)
      if (results.length >= 3) {
        throw new BadRequestException(
          'You can only join a maximum of 3 compete to earn leagues'
        )
      }
    }

    const leaderboardEntry = await this.leaguesRepository.manager.transaction(
      async (manager) => {
        const repository = manager.getRepository(League)
        const leaderboardEntryRepository =
          manager.getRepository(LeaderboardEntry)
        const invitationRepository = manager.getRepository(LeaguesInvitation)
        const userRepository = manager.getRepository(User)
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

        // Update the invitation to accepted
        await invitationRepository.update(
          {
            to_user: {
              id: userId
            },
            league: {
              id: leagueId
            }
          },
          {
            accepted: true
          }
        )

        // Update the user's total unread invitation count
        await userRepository.update(
          {
            id: userId
          },
          {
            league_invitations_total: await invitationRepository.count({
              to_user: { id: userId },
              dismissed: false,
              accepted: false
            })
          }
        )

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

    // Sport should not be re-assignable
    // The value is ignored
    // if (sportId) {
    //   // Assign the sport
    //   update.sport = new Sport()
    //   update.sport.id = sportId
    // }

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

      // Delete league invitations for league
      await entityManager.getRepository(LeaguesInvitation).delete({
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
      .leftJoinAndSelect('user.avatar', 'avatar')
      .where('league.id = :leagueId AND leaderboard.id = entryLeaderboard.id', {
        leagueId
      })
      .orderBy('entry.bfit_earned', 'DESC')
      .addOrderBy('entry.points', 'DESC')
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
   * Find Leaderboard entry by user id
   *
   * @param leaderboardId
   * @param userId
   */
  async getLeaderboardMemberByUserId(
    leagueId: string,
    userId: string
  ): Promise<LeaderboardEntry & { user: UserPublic }> {
    const query = this.leaderboardEntryRepository
      .createQueryBuilder('entry')
      .innerJoin('entry.leaderboard', 'entryLeaderboard')
      .innerJoin('entryLeaderboard.league', 'league')
      .innerJoin('league.active_leaderboard', 'leaderboard')
      .innerJoinAndSelect('entry.user', 'user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .where(
        'league.id = :leagueId AND leaderboard.id = entryLeaderboard.id AND entry.user.id = :userId',
        {
          leagueId,
          userId
        }
      )
    const result = await query.getOne()

    return result ? this.getLeaderboardEntryPublic(result) : null
  }

  async getLeagueIfInvited(leagueId: string, userId: string) {
    const league = await this.leaguesRepository
      .createQueryBuilder('league')
      .innerJoin('league.invitations', 'invitation')
      .where('invitation.to_user.id = :userId AND league.id = :leagueId', {
        userId,
        leagueId
      })
      .getOne()
    return league
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
      .leftJoinAndSelect('user.teams', 'userTeam')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect(
        'user.leagues',
        'userLeague',
        'userLeague.id = :leagueId',
        { leagueId }
      )
      .leftJoin('userTeam.organisation', 'userOrganisation')
      .leftJoin('league', 'league', 'league.id = :leagueId', { leagueId })
      .leftJoin('league.users', 'leagueUser', 'leagueUser.id = user.id')
      .leftJoin('user.leagues_invitations', 'i1')
      .leftJoinAndSelect(
        'user.leagues_invitations',
        'invitation',
        'i1.id = invitation.id AND invitation.to_user.id = user.id AND invitation.league.id = :leagueId',
        { userId, leagueId }
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
      results: this.commonService.mapUserPublic(results),
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

    const rank =
      await this.leaderboardEntriesService.findRankAndFlanksInLeaderboard(
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
        user: this.commonService.getUserPublic(rankEntry.user as User)
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

    const winners = entries
      .filter(
        (entry) =>
          entry.rank === '1' || entry.rank === '2' || entry.rank === '3'
      )
      .sort((a, b) => {
        return Number(a.rank) - Number(b.rank)
      })
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

      const coreWinners = winners.filter((winner) => winner.rank === '1')
      const leaderboard = await this.leaderboardRepository.save(
        this.leaderboardRepository.create({
          league: league
        })
      )

      const currentEntries = league.active_leaderboard.entries

      await this.leaguesRepository.manager.transaction(async (manager) => {
        const repo = manager.getRepository(LeaderboardEntry)
        const leagueRepo = manager.getRepository(League)
        const leaderboardRepo = manager.getRepository(Leaderboard)
        await Promise.all(
          league.users.map(async (leagueUser) => {
            const winner = winners.find(
              (e) => leagueUser.id === e.user.id && e.rank === '1'
            )
            const user = new User()
            user.id = leagueUser.id

            // check if the league is CompeteToEarn
            if (league.access === LeagueAccess.CompeteToEarn) {
              // we check if the user is in the winner which provides top 3
              const bfitBonus = winners.find(
                (winner) => leagueUser.id === winner.user.id
              )

              // we not get they estimate earnings and reward them
              const entry = currentEntries.find(
                (entry) => entry.user_id === leagueUser.id
              )

              const bfit = getBfitEarning(
                bfitBonus.rank,
                league.bfitWinnerPot,
                entry.bfit_estimate
              )

              let bfitEarnings = new LeagueBfitEarnings()
              bfitEarnings.user_id = league.id
              bfitEarnings.league_id = league.id
              bfitEarnings.bfit_amount = bfit
              let savedEarnings = await this.leagueBfitEarningsRepository.save(
                bfitEarnings
              )
              let walletTransaction = new WalletTransaction()
              walletTransaction.source =
                WalletTransactionSource.LeagueBfitEarnings
              walletTransaction.earnings_id = savedEarnings.id
              walletTransaction.league_id = league.id
              walletTransaction.league_name = league.name
              walletTransaction.user_id = leagueUser.id
              walletTransaction.bfit_amount = bfit
              await this.walletTransactionRepository.save(walletTransaction)

              return repo.save(
                repo.create({
                  user,
                  leaderboard,
                  leaderboard_id: leaderboard.id,
                  league_id: league.id,
                  user_id: leagueUser.id,
                  wins: winner ? winner.wins + 1 : 0,
                  bfit_earned: bfit,
                  bfit_estimate: 0
                })
              )
            } else {
              return repo.save(
                repo.create({
                  user,
                  leaderboard,
                  leaderboard_id: leaderboard.id,
                  league_id: league.id,
                  user_id: leagueUser.id,
                  wins: winner ? winner.wins + 1 : 0
                })
              )
            }
          })
        )

        await leaderboardRepo.update(league.active_leaderboard.id, {
          completed: true
        })

        await leagueRepo.update(league.id, {
          active_leaderboard: leaderboard,
          ends_at: addDays(new Date(), league.duration)
        })
      })

      await this.emitWinnerFeedItems(league.id, coreWinners)
      return {
        name: league.name,
        winners: coreWinners.length,
        users: league.users.length,
        restarted: true
      }
    } else if (league.active_leaderboard) {
      const { winners } = await this.calculateLeagueWinners(league.id)
      const coreWinners = winners.filter((winner) => winner.rank === '1')

      await this.leaguesRepository.manager.transaction(async (manager) => {
        const repo = manager.getRepository(LeaderboardEntry)
        const leagueRepo = manager.getRepository(League)
        const leaderboardRepo = manager.getRepository(Leaderboard)

        if (league.access === LeagueAccess.CompeteToEarn) {
          const currentEntries = league.active_leaderboard.entries
          await Promise.all(
            league.users.map(async (leagueUser) => {
              const winner = winners.find(
                (e) => leagueUser.id === e.user.id && e.rank === '1'
              )
              const user = new User()
              user.id = leagueUser.id

              // check if the league is CompeteToEarn
              if (league.access === LeagueAccess.CompeteToEarn) {
                // we check if the user is in the winner which provides top 3
                const bfitBonus = winners.find(
                  (winner) => leagueUser.id === winner.user.id
                )

                // we not get they estimate earnings and reward them
                const entry = currentEntries.find(
                  (entry) => entry.user_id === leagueUser.id
                )

                const bfit = getBfitEarning(
                  bfitBonus.rank,
                  league.bfitWinnerPot,
                  entry.bfit_estimate
                )
                let bfitEarnings = new LeagueBfitEarnings()
                bfitEarnings.user_id = league.id
                bfitEarnings.league_id = league.id
                bfitEarnings.bfit_amount = bfit
                let savedEarnings =
                  await this.leagueBfitEarningsRepository.save(bfitEarnings)
                let walletTransaction = new WalletTransaction()
                walletTransaction.source =
                  WalletTransactionSource.LeagueBfitEarnings
                walletTransaction.earnings_id = savedEarnings.id
                walletTransaction.league_id = league.id
                walletTransaction.league_name = league.name
                walletTransaction.user_id = leagueUser.id
                walletTransaction.bfit_amount = bfit
                await this.walletTransactionRepository.save(walletTransaction)

                return repo.save({
                  ...entry,
                  bfit_earned: bfit,
                  wins: winner ? winner.wins + 1 : 0,
                  bfit_estimate: 0
                })
              }
            })
          )
        } else {
          await Promise.all(
            coreWinners.map((winner) => {
              return repo.save({
                ...winner,
                wins: winner.wins + 1
              })
            })
          )
        }
        await leaderboardRepo.update(league.active_leaderboard.id, {
          completed: true
        })

        await leagueRepo.update(league.id, {
          active_leaderboard: null
        })
      })

      await this.emitWinnerFeedItems(league.id, winners)
      return {
        name: league.name,
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
      .leftJoinAndSelect('league.active_leaderboard', 'active_leaderboard')
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
    const leaguesEnded = results.map((e) => e && !e.restarted).length
    const result = {
      leagues_processed: totalLeagues,
      leagues_restarted: leaguesRestarted
    }

    await this.commonService.notifySlackJobs(
      'Leagues ended / restarted',
      {
        restarted: {
          total: leaguesRestarted,
          leagues: results.filter((e) => e && e.restarted)
        },
        ended: {
          total: leaguesEnded,
          leagues: results.filter((e) => e && !e.restarted)
        }
      },
      differenceInMilliseconds(new Date(), started)
    )

    return result
  }

  /**
   * Within a one hour window period, check when leagues are
   * ending.
   */
  async processLeaguesEnding() {
    const started = new Date()
    const leagues = await this.leaguesRepository
      .createQueryBuilder('league')
      .innerJoinAndSelect('league.active_leaderboard', 'active_leaderboard')
      .leftJoinAndSelect('league.users', 'users')
      .where(
        'league.ends_at >= :hoursFromNow23 AND league.ends_at <= :endDate',
        {
          hoursFromNow23: addHours(new Date(), 23),
          endDate: addHours(new Date(), 24)
        }
      )
      .andWhere('active_leaderboard.completed = false')
      .limit(100)
      .getMany()

    const messages = await Promise.all(
      leagues.map(async (league) => {
        return this.notificationsService.sendAction(
          league.users as User[],
          NotificationAction.LeagueEnding,
          {
            subject: league.name
          },
          {
            leagueId: league.id
          }
        )
      })
    )

    await this.commonService.notifySlackJobs(
      'Leagues ending reminder',
      {
        messages,
        reminded: {
          total: leagues.length,
          leagues: leagues.map((each) => ({
            name: each.name,
            users: each.users.length
          }))
        }
      },
      differenceInMilliseconds(new Date(), started)
    )

    return {
      total: leagues.length,
      messages
    }
  }

  async getTeamLeaguesForPublicPage(
    teamId: string
  ): Promise<PublicPageLeague[]> {
    const leagues = await this.leaguesRepository
      .createQueryBuilder('league')
      .where('league.team.id = :teamId', {
        teamId
      })
      .leftJoinAndSelect('league.image', 'image')
      .leftJoinAndSelect('league.sport', 'sport')
      .limit(50)
      .getMany()

    return leagues.map((e) => ({
      photo_url: e.image.url,
      description: e.description,
      title: e.name,
      sport: e.sport,
      repeat: e.repeat,
      participants_total: e.participants_total,
      duration: e.duration
    }))
  }

  async sendBfitClaimTransaction(
    league_id: string,
    user_id: string,
    amount: number
  ) {
    const RPC_ENDPOINT = 'https://test-rpc-kujira.mintthemoon.xyz/'
    const { BFIT_EARNINGS_SC_ADDRESS } = process.env
    const { MNEMONIC } = process.env

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
      prefix: 'kujira'
    })
    const [account] = await signer.getAccounts()
    const client = await SigningStargateClient.connectWithSigner(
      RPC_ENDPOINT,
      signer,
      {
        registry,
        gasPrice: GasPrice.fromString('0.00125ukuji')
      }
    )

    const mesg = msg.wasm.msgExecuteContract({
      sender: account.address,
      contract: BFIT_EARNINGS_SC_ADDRESS,
      msg: Buffer.from(
        JSON.stringify({
          save_user_bfit_earnings: {
            league_id,
            participant: user_id,
            amount: amount.toString()
          }
        })
      ),
      funds: []
    })
    const sig = await client.signAndBroadcast(account.address, [mesg], 'auto')
    return sig.transactionHash
  }
}
