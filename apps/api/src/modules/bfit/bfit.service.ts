import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { LeagueBfitEarnings } from "../leagues/entities/bfit-earnings.entity";
import { League } from "../leagues/entities/league.entity";
import { LeagueAccess } from "../leagues/leagues.constants";
import { WalletTransaction } from "../wallet-transactions/entities/wallet-transaction.entity";
import { WalletTransactionSource } from "../wallet-transactions/wallet-transactions.constants";
import { LeaguesService } from "../leagues/leagues.service";
import { SqsMessageHandler, } from "@ssut/nestjs-sqs";
import { tryAndCatch } from "../../helpers/tryAndCatch";
import { Sport } from "../sports/entities/sport.entity";
import { LeaderboardEntry } from "../leaderboard-entries/entities/leaderboard-entry.entity";
import { BfitActivityTypes } from "./bfit.types";
import { QUEUE_NAME } from "./bfit.constant";

@Injectable()
export class BfitDistributionService {

	constructor(
		@InjectRepository(League)
		private leaguesRepository: Repository<League>,
		private leaguesService: LeaguesService,
		@InjectRepository(LeagueBfitEarnings)
		private leagueBfitEarningsRepository: Repository<LeagueBfitEarnings>,

		@InjectRepository(WalletTransaction)
		private walletTransactionRepository: Repository<WalletTransaction>,
		@InjectRepository(LeaderboardEntry)
		private leaderboardEntriesRepository: Repository<LeaderboardEntry>,
	) { }


	@SqsMessageHandler(QUEUE_NAME, false)
	handleMessage(message: AWS.SQS.Message) {
		const { type, userId, sport } = JSON.parse(message.Body) as { type: BfitActivityTypes, sport?: Sport; userId: string; };
		console.info(`Received BFIT message from queue: ${JSON.stringify(message)}`);
		if (type === BfitActivityTypes.steps) {
			console.info(`Message type is steps`);
			return this.updateStepsLeagueBfit(userId)
		} else if (type === BfitActivityTypes.sport) {
			console.info(`Message type is health activity sports`);
			return this.updateLeagueBfit(userId, sport)
		}
		console.error(`Message type is not supported: ${type}`)
	}


	private async updateLeagueBfit(userId: string, sport: Sport) {
		// $BFIT = daily_bfit * user_league_points / total_user_league_points
		// daily_bfit = (league_participants/total_compete_to_earn_league_participants* 6850)
		// 6850 is the amount of bfit minted daily
		const [leagues, leaguesErr] = await tryAndCatch(
			this.leaguesRepository.find({
				where: {
					sport,
					active_leaderboard: Not(IsNull()),
					access: LeagueAccess.CompeteToEarn
				},
				relations: ['active_leaderboard', 'users']
			})
		)
		leaguesErr && console.error(leaguesErr)
		const incrementEntryPromises = []
		let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
			.createQueryBuilder('league')
			.leftJoin('league.users', 'user')
			.where('league.access = :access', {
				access: LeagueAccess.CompeteToEarn
			})
			.select('COUNT(user.id)', 'totalUsers')
			.getRawOne()

		totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers
		for (const league of leagues) {
			const leagueUsers = league.participants_total
			// we multiply by 1000000 because BFIT has 6 decimals
			const dailyBfit = Math.round(
				(leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
			)
			const alreadyDistributedAmount =
				await this.leaguesService.getUserTotalLeagueDailyBfitEarnings(league.id)
			const dailyBfitInFullDecimals = dailyBfit * 1000000
			let amountAvailableToDistribute =
				(dailyBfitInFullDecimals - alreadyDistributedAmount.total) / 1000000
			if (amountAvailableToDistribute <= 0) {
				amountAvailableToDistribute = 0
				console.info(`No BFIT to distribute for league: ${league.id}`)
			}
			const existingLeaderboardEntry =
				await this.leaderboardEntriesRepository.findOne({
					user_id: userId,
					league_id: league.id
				})
			if (existingLeaderboardEntry) {
				const points = existingLeaderboardEntry.points
				let total_user_league_points = await this.leaderboardEntriesRepository
					.createQueryBuilder('leaderboard_entry')
					.select('SUM(leaderboard_entry.points)', 'totalPoints')
					.where('leaderboard_entry.league_id = :leagueId', {
						leagueId: league.id
					})
					.getRawOne()
				total_user_league_points = parseInt(
					total_user_league_points.totalPoints,
					10
				)
				// we multiply by 1000_000 because $BFIT has 6 decimals
				let bfit = Math.round(
					amountAvailableToDistribute *
					((points / total_user_league_points) * 1000_000)
				)
				if (bfit > 0) {
					// increment user bfit
					incrementEntryPromises.push(
						this.leaderboardEntriesRepository.increment(
							{
								leaderboard: { id: league.active_leaderboard.id },
								user: { id: userId }
							},

							'bfit_earned',
							bfit
						)
					)
					// increment total league bfit
					incrementEntryPromises.push(
						this.leaguesRepository.increment(
							{
								id: league.id
							},

							'bfit',
							bfit
						)
					)

					let bfitEarnings = new LeagueBfitEarnings()
					bfitEarnings.user_id = userId
					bfitEarnings.league_id = league.id
					bfitEarnings.bfit_amount = bfit
					let savedEarnings = await this.leagueBfitEarningsRepository.save(
						bfitEarnings
					)
					let walletTransaction = new WalletTransaction()
					walletTransaction.source = WalletTransactionSource.LeagueBfitEarnings
					walletTransaction.earnings_id = savedEarnings.id
					walletTransaction.league_id = league.id
					walletTransaction.league_name = league.name
					walletTransaction.user_id = userId
					walletTransaction.bfit_amount = bfit
					incrementEntryPromises.push(
						this.walletTransactionRepository.save(walletTransaction)
					)
				} else {
					console.info(`No BFIT to distribute for user: ${userId} in league: ${league.id}. Amount available to distribute: ${amountAvailableToDistribute} but BFIT earned is 0.`)
					console.info(`Total user league points ${total_user_league_points} and user points ${points}`)
				}
			} else {
				const errorMessage = `User ${userId} is not in league Entries ${league.id}`;
				console.error(`User ${userId} is not in league Entries ${league.id}`)
				throw new Error(errorMessage);
			}
		}

		return await Promise.all(incrementEntryPromises).then(res => {
			console.info(`Updated user ${userId} league bfit earnings`, JSON.stringify(res));
		})
	}

	private async updateStepsLeagueBfit(userId: string) {
		// $BFIT = daily_bfit * user_league_points / total_user_league_points
		// daily_bfit = (league_participants/total_compete_to_earn_league_participants* 6850)
		// 6850 is the amount of bfit minted daily
		const competeToEarnStepsLeagues = await this.leaguesRepository
			.createQueryBuilder('league')
			.innerJoinAndSelect('league.active_leaderboard', 'leaderboard')
			.innerJoinAndSelect('league.sport', 'sport')
			.leftJoin('leaderboard.entries', 'entries')
			.where('entries.user.id = :userId', { userId })
			.andWhere('sport.name_key = :steps', { steps: 'steps' })
			.andWhere('league.access = :leagueAccess', {
				leagueAccess: LeagueAccess.CompeteToEarn
			})
			.getMany()
		const incrementEntryPromises = []
		let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
			.createQueryBuilder('league')
			.leftJoin('league.users', 'user')
			.where('league.access = :access', {
				access: LeagueAccess.CompeteToEarn
			})
			.select('COUNT(user.id)', 'totalUsers')
			.getRawOne()

		totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers
		for (const league of competeToEarnStepsLeagues) {
			const leagueUsers = league.participants_total
			// we multiply by 1000000 because BFIT has 6 decimals
			const dailyBfit = Math.round(
				(leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
			)

			const alreadyDistributedAmount =
				await this.leaguesService.getUserTotalLeagueDailyBfitEarnings(league.id)
			const dailyBfitInFullDecimals = dailyBfit * 1000000
			let amountAvailableToDistribute =
				(dailyBfitInFullDecimals - alreadyDistributedAmount.total) / 1000000
			if (amountAvailableToDistribute <= 0) {
				amountAvailableToDistribute = 0
			}

			const existingLeaderboardEntry =
				await this.leaderboardEntriesRepository.findOne({
					user_id: userId,
					league_id: league.id
				})
			if (existingLeaderboardEntry) {
				const points = existingLeaderboardEntry.points
				let total_user_league_points = await this.leaderboardEntriesRepository
					.createQueryBuilder('leaderboard_entry')
					.select('SUM(leaderboard_entry.points)', 'totalPoints')
					.where('leaderboard_entry.league_id = :leagueId', {
						leagueId: league.id
					})
					.getRawOne()
				total_user_league_points = parseInt(
					total_user_league_points.totalPoints,
					10
				)
				// we multiply by 1000_000 because $BFIT has 6 decimals
				let bfit = Math.round(
					amountAvailableToDistribute *
					((points / total_user_league_points) * 1000_000)
				)
				if (bfit > 0) {
					// increment user bfit
					incrementEntryPromises.push(
						this.leaderboardEntriesRepository.increment(
							{
								leaderboard: { id: league.active_leaderboard.id },
								user: { id: userId }
							},

							'bfit_earned',
							bfit
						)
					)
					// increment total league bfit
					incrementEntryPromises.push(
						this.leaguesRepository.increment(
							{
								id: league.id
							},

							'bfit',
							bfit
						)
					)

					let bfitEarnings = new LeagueBfitEarnings()
					bfitEarnings.user_id = userId
					bfitEarnings.league_id = league.id
					bfitEarnings.bfit_amount = bfit
					let savedEarnings = await this.leagueBfitEarningsRepository.save(
						bfitEarnings
					)
					let walletTransaction = new WalletTransaction()
					walletTransaction.source = WalletTransactionSource.LeagueBfitEarnings
					walletTransaction.earnings_id = savedEarnings.id
					walletTransaction.league_id = league.id
					walletTransaction.league_name = league.name
					walletTransaction.user_id = userId
					walletTransaction.bfit_amount = bfit
					incrementEntryPromises.push(
						this.walletTransactionRepository.save(walletTransaction)
					)
				}
			}
		}

		return await Promise.all(incrementEntryPromises)
	}
}