import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { LeagueAccess } from '../leagues/leagues.constants'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, Repository } from 'typeorm'
import { League } from '../leagues/entities/league.entity'
import { LeagueWaitlistUser } from '../leagues/entities/league-waitlist-user.entity'
import { tryAndCatch } from '../../helpers/tryAndCatch'
import { LeaguesService } from '../leagues/leagues.service'
import { leagueBfitPots } from '../../helpers/bfit-helpers'

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)

  constructor(
    @InjectRepository(League)
    private leaguesRepository: Repository<League>,
    @InjectRepository(LeagueWaitlistUser)
    private leagueWaitlistUserRepository: Repository<LeagueWaitlistUser>,


    private leaguesService: LeaguesService
  ) {}

  @Cron('20 0 * * *')
  async handleLeagueBfitCalculations() {
    this.logger.debug('Calculating BFIT for leagues')

    const [leagues, leagueErr] = await tryAndCatch(
      this.leaguesRepository.find({
        where: {
          active_leaderboard: Not(IsNull()),
          access: LeagueAccess.CompeteToEarn
        },
        relations: ['active_leaderboard', 'users']
      })
    )

    if (leagueErr) {
      this.logger.error(leagueErr)
      return
    }

    let totalCompeteToEarnLeaguesUsers: number = await this.leaguesRepository
      .createQueryBuilder('league')
      .leftJoin('league.users', 'user')
      .where('league.access = :access', {
        access: LeagueAccess.CompeteToEarn
      })
      .select('COUNT(user.id)', 'totalUsers')
      .getRawOne()
      .then((res) => parseInt(res.totalUsers, 10))

    for (const league of leagues) {
      const [bfitAllocation, bfitWinnerPot] = leagueBfitPots(
        league.participants_total,
        totalCompeteToEarnLeaguesUsers
      )

      await this.leaguesRepository.increment(
        {
          id: league.id
        },
        'bfitAllocation',
        bfitAllocation
      )
      await this.leaguesRepository.increment(
        {
          id: league.id
        },
        'bfitWinnerPot',
        bfitWinnerPot
      )
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleJoinLeagueFromWaitlist() {
    this.logger.debug('Adding users to leagues from waitlist')
    const waitlistUsers = await this.leagueWaitlistUserRepository.find({})
    if (waitlistUsers.length) {
      await Promise.all(
        waitlistUsers.map((waitlistUser: LeagueWaitlistUser) => {
          this.leaguesService.joinLeagueFromWaitlist(
            waitlistUser.league_id,
            waitlistUser.user_id
          )
        })
      )
    }
    await this.leagueWaitlistUserRepository.delete({})
  }
}
