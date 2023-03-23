import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeagueAccess } from '../leagues/leagues.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { League } from '../leagues/entities/league.entity';
import { tryAndCatch } from '../../helpers/tryAndCatch';
import { leagueBfitPots } from '../../helpers/bfit-helpers';

@Injectable()
export class TasksService {
	private readonly logger = new Logger(TasksService.name);

	constructor(
		@InjectRepository(League)
		private leaguesRepository: Repository<League>,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleLeagueBfitCalculations() {
		this.logger.debug('Calculating BFIT for leagues');


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
			this.logger.error(leagueErr);
			return;
		}

		let totalCompeteToEarnLeaguesUsers: number = await this.leaguesRepository
			.createQueryBuilder('league')
			.leftJoin('league.users', 'user')
			.where('league.access = :access', {
				access: LeagueAccess.CompeteToEarn
			})
			.select('COUNT(user.id)', 'totalUsers')
			.getRawOne().then(res => parseInt(res.totalUsers, 10));

		for (const league of leagues) {
			const [
				bfitAllocation,
				bfitWinnerPot
			] = leagueBfitPots(league.participants_total, totalCompeteToEarnLeaguesUsers)


			await this.leaguesRepository.update(
				{
					id: league.id
				},
				{
					bfitAllocation: bfitAllocation,
					bfitWinnerPot: bfitWinnerPot
				}
			)
		}
	}

}