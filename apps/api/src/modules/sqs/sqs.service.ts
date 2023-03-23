import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { League } from "../leagues/entities/league.entity";
import { LeagueAccess } from "../leagues/leagues.constants";
import { SqsMessageHandler, } from "@ssut/nestjs-sqs";
import { tryAndCatch } from "../../helpers/tryAndCatch";
import { Sport } from "../sports/entities/sport.entity";
import { LeaderboardEntry } from "../leaderboard-entries/entities/leaderboard-entry.entity";
import { SQSTypes } from "./sqs.types";
import { QUEUE_NAME } from "./sqs.constant";
import { HealthActivitiesService } from "../health-activities/health-activities.service";
import { WebhookEventActivity } from "../providers/types/webhook";
import { HealthActivityDto } from "../health-activities/dto/create-health-activity.dto";

@Injectable()
export class BfitDistributionService {

	constructor(
		@InjectRepository(League)
		private leaguesRepository: Repository<League>,
		@InjectRepository(LeaderboardEntry)
		private leaderboardEntriesRepository: Repository<LeaderboardEntry>,
		private healthActivityService: HealthActivitiesService,
	) { }


	@SqsMessageHandler(QUEUE_NAME, false)
	handleMessage(message: AWS.SQS.Message) {
		const { type, userId, ...additionalInfo } = JSON.parse(message.Body) as {
			type: SQSTypes,
			sport?: Sport;
			userId: string;
			activity?: HealthActivityDto,
			webhookEventActivity?: WebhookEventActivity,
		};
		console.info(`Received SQS message from queue: ${JSON.stringify(message)}`);
		if (type === SQSTypes.steps) {
			console.info(`Message type is steps`);
			// testing steps as any other sport calculations
			return this.updateLeagueBfit(userId, 'steps')
		} else if (type === SQSTypes.sport) {
			console.info(`Message type is health activity sports`);
			return this.updateLeagueBfit(userId, additionalInfo.sport.name_key)
		} else if (type === SQSTypes.points) {
			console.info(`Message type is points`);
			this.healthActivityService.create(
				additionalInfo.activity,
				userId,
				additionalInfo.webhookEventActivity
			)

		} else {
			console.error(`Message type is not supported: ${type}`)
		}
	}


	private async updateLeagueBfit(userId: string, sport: string) {
		//TODO: Make this check if user exists in the league so we can use find one
		const [league, leagueErr] = await tryAndCatch(
			this.leaguesRepository
				.createQueryBuilder('league')
				.leftJoin('league.users', 'user')
				.innerJoinAndSelect('league.sport', 'sport')
				.where('sport.name_key = :sport', { sport: 'steps' })
				.andWhere('league.active_leaderboard IS NOT NULL')
				.andWhere('league.access = :access', { access: LeagueAccess.CompeteToEarn })
				.andWhere('user.id = :userId', { userId })
				.leftJoinAndSelect('league.active_leaderboard', 'active_leaderboard')
				.getOne()
		);
		if (leagueErr) {
			console.error(leagueErr);
			throw leagueErr;
		}

		if (!league.active_leaderboard.entries) {
			console.error(`No entries found for league ${league.id}`);
			throw new Error(`No entries found for league ${league.id}`);
		}

		const totalLeaguePoints = parseInt(
			await this.leaderboardEntriesRepository
			.createQueryBuilder('leaderboard_entry')
			.select('SUM(leaderboard_entry.points)', 'totalPoints')
			.where('leaderboard_entry.league_id = :leagueId', {
				leagueId: league.id
			})
				.getRawOne(),
			10
		)

		const bfitEstimatePromises = [];
		// we want to double check this users that triggered the recount has earned points
		let hasUserEntry = false;
		for (const entry of league.active_leaderboard.entries) {
			if (entry.user_id === userId) {
				hasUserEntry = true;
			}

			const bfitEstimate = league.bfitAllocation * (entry.points / totalLeaguePoints);

			bfitEstimatePromises.push(
				this.leaderboardEntriesRepository.increment(
					{
						leaderboard: { id: league.active_leaderboard.id },
						user: { id: userId }
					},
					'bfit_estimate',
					bfitEstimate
				)
			)
		}

		if (!hasUserEntry) {
			/// we need to see why and what we can do here if this happens
			console.error(`User ${userId} does not have an entry in the league ${league.id}`);
		}

		return await Promise.all(bfitEstimatePromises);
	}

	// private async updateStepsLeagueBfit(userId: string) {
	// 	// $BFIT = daily_bfit * user_league_points / total_user_league_points
	// 	// daily_bfit = (league_participants/total_compete_to_earn_league_participants* 6850)
	// 	// 6850 is the amount of bfit minted daily
	// 	const competeToEarnStepsLeagues = await this.leaguesRepository
	// 		.createQueryBuilder('league')
	// 		.innerJoinAndSelect('league.active_leaderboard', 'leaderboard')
	// 		.innerJoinAndSelect('league.sport', 'sport')
	// 		.leftJoin('leaderboard.entries', 'entries')
	// 		.where('entries.user.id = :userId', { userId })
	// 		.andWhere('sport.name_key = :steps', { steps: 'steps' })
	// 		.andWhere('league.access = :leagueAccess', {
	// 			leagueAccess: LeagueAccess.CompeteToEarn
	// 		})
	// 		.getMany()
	// 	const incrementEntryPromises = []
	// 	let totalCompeteToEarnLeaguesUsers = await this.leaguesRepository
	// 		.createQueryBuilder('league')
	// 		.leftJoin('league.users', 'user')
	// 		.where('league.access = :access', {
	// 			access: LeagueAccess.CompeteToEarn
	// 		})
	// 		.select('COUNT(user.id)', 'totalUsers')
	// 		.getRawOne()

	// 	totalCompeteToEarnLeaguesUsers = totalCompeteToEarnLeaguesUsers.totalUsers
	// 	for (const league of competeToEarnStepsLeagues) {
	// 		const leagueUsers = league.participants_total
	// 		// we multiply by 1000000 because BFIT has 6 decimals
	// 		const dailyBfit = Math.round(
	// 			(leagueUsers / totalCompeteToEarnLeaguesUsers) * 6850
	// 		)

	// 		const alreadyDistributedAmount =
	// 			await this.leaguesService.getUserTotalLeagueDailyBfitEarnings(league.id)
	// 		const dailyBfitInFullDecimals = dailyBfit * 1000000
	// 		let amountAvailableToDistribute =
	// 			(dailyBfitInFullDecimals - alreadyDistributedAmount.total) / 1000000
	// 		if (amountAvailableToDistribute <= 0) {
	// 			amountAvailableToDistribute = 0
	// 		}

	// 		const existingLeaderboardEntry =
	// 			await this.leaderboardEntriesRepository.findOne({
	// 				user_id: userId,
	// 				league_id: league.id
	// 			})
	// 		if (existingLeaderboardEntry) {
	// 			const points = existingLeaderboardEntry.points
	// 			let total_user_league_points = await this.leaderboardEntriesRepository
	// 				.createQueryBuilder('leaderboard_entry')
	// 				.select('SUM(leaderboard_entry.points)', 'totalPoints')
	// 				.where('leaderboard_entry.league_id = :leagueId', {
	// 					leagueId: league.id
	// 				})
	// 				.getRawOne()
	// 			total_user_league_points = parseInt(
	// 				total_user_league_points.totalPoints,
	// 				10
	// 			)
	// 			// we multiply by 1000_000 because $BFIT has 6 decimals
	// 			let bfit = Math.round(
	// 				amountAvailableToDistribute *
	// 				((points / total_user_league_points) * 1000_000)
	// 			)
	// 			if (bfit > 0) {
	// 				// increment user bfit
	// 				incrementEntryPromises.push(
	// 					this.leaderboardEntriesRepository.increment(
	// 						{
	// 							leaderboard: { id: league.active_leaderboard.id },
	// 							user: { id: userId }
	// 						},

	// 						'bfit_earned',
	// 						bfit
	// 					)
	// 				)
	// 				// increment total league bfit
	// 				incrementEntryPromises.push(
	// 					this.leaguesRepository.increment(
	// 						{
	// 							id: league.id
	// 						},

	// 						'bfit',
	// 						bfit
	// 					)
	// 				)

	// 				let bfitEarnings = new LeagueBfitEarnings()
	// 				bfitEarnings.user_id = userId
	// 				bfitEarnings.league_id = league.id
	// 				bfitEarnings.bfit_amount = bfit
	// 				let savedEarnings = await this.leagueBfitEarningsRepository.save(
	// 					bfitEarnings
	// 				)
	// 				let walletTransaction = new WalletTransaction()
	// 				walletTransaction.source = WalletTransactionSource.LeagueBfitEarnings
	// 				walletTransaction.earnings_id = savedEarnings.id
	// 				walletTransaction.league_id = league.id
	// 				walletTransaction.league_name = league.name
	// 				walletTransaction.user_id = userId
	// 				walletTransaction.bfit_amount = bfit
	// 				incrementEntryPromises.push(
	// 					this.walletTransactionRepository.save(walletTransaction)
	// 				)
	// 			}
	// 		}
	// 	}

	// 	return await Promise.all(incrementEntryPromises)
	// }
}