import { Injectable, Logger } from "@nestjs/common";
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

	private readonly logger = new Logger(BfitDistributionService.name);

	constructor(
		@InjectRepository(League)
		private leaguesRepository: Repository<League>,
		@InjectRepository(LeaderboardEntry)
		private leaderboardEntriesRepository: Repository<LeaderboardEntry>,
		private healthActivityService: HealthActivitiesService,
	) { }


	@SqsMessageHandler(QUEUE_NAME, false)
	handleMessage(message: AWS.SQS.Message) {
		this.logger.log(`Received message: ${message.Body}`);
		const { type, userId, ...additionalInfo } = JSON.parse(message.Body) as {
			type: SQSTypes,
			sport?: Sport;
			userId: string;
			activity?: HealthActivityDto,
			webhookEventActivity?: WebhookEventActivity,
		};
		if (type === SQSTypes.steps) {
			return this.updateLeagueBfit(userId, 'steps')
		} else if (type === SQSTypes.sport) {
			return this.updateLeagueBfit(userId, additionalInfo.sport.name_key)
		} else if (type === SQSTypes.points) {
			this.logger.log(`Received points message: ${message.Body}`);
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
		this.logger.log(`Updating league bfit for user ${userId} and sport ${sport}`);
		const [league, leagueErr] = await tryAndCatch(
			this.leaguesRepository
				.createQueryBuilder('league')
				.leftJoin('league.users', 'user')
				.innerJoinAndSelect('league.sport', 'sport')
				.where('sport.name_key = :sport', { sport: sport })
				.andWhere('league.active_leaderboard IS NOT NULL')
				.andWhere('league.access = :access', { access: LeagueAccess.CompeteToEarn })
				.andWhere('user.id = :userId', { userId })
				.leftJoinAndSelect('league.active_leaderboard', 'active_leaderboard')
				.leftJoinAndSelect('active_leaderboard.entries', 'entries')
				.getOne()
		);
		if (leagueErr) {
			this.logger.error(`Error getting league for user ${userId} and sport ${sport} - likely no compete to earn league for this sport for this user`);
			throw leagueErr;
		}

		if (!league.active_leaderboard.entries) {
			this.logger.log(`No entries found for league ${league.id}`);
			throw new Error(`No entries found for league ${league.id}`);
		}

		this.logger.log(`total entries for league ${league.id}: ${league.active_leaderboard.entries.length}`);


		const totalPoints = await this.leaderboardEntriesRepository
			.createQueryBuilder('leaderboard_entry')
			.select('SUM(leaderboard_entry.points)', 'totalPoints')
			.where('leaderboard_entry.league_id = :leagueId', {
				leagueId: league.id
			})
			.getRawOne()
		const totalLeaguePoints = parseInt(
			totalPoints.totalPoints,
			10
		)
		this.logger.log(`Total league points: ${totalLeaguePoints}`);

		const bfitEstimatePromises = [];
		// we want to double check this users that triggered the recount has earned points
		let hasUserEntry = false;
		for (const entry of league.active_leaderboard.entries) {
			this.logger.log(`Updating entry ${entry.id} for user ${entry.user_id} with points ${entry.points}`);
			if (entry.user_id === userId) {
				hasUserEntry = true;
			}

			const bfitEstimate = (league.bfitAllocation * (entry.points / totalLeaguePoints)) * 1000_000;

			this.logger.log(`Updating entry ${entry.id} for user ${entry.user_id} with bfit estimate ${bfitEstimate}`);
			if (bfitEstimate === 0 && entry.bfit_estimate === 0) {
				this.logger.log(`Skipping entry ${entry.id} for user ${entry.user_id} with bfit estimate ${bfitEstimate}`);
				continue;
			}
			bfitEstimatePromises.push(
				this.leaderboardEntriesRepository.update(
					{
						leaderboard: { id: league.active_leaderboard.id },
						user: { id: userId }
					},
					{
						bfit_estimate: bfitEstimate
					}
				)
			)
		}

		if (!hasUserEntry) {
			/// we need to see why and what we can do here if this happens
			this.logger.error(`User ${userId} does not have an entry in the league ${league.id}`);
		}
		try {
			this.logger.log(`Updating bfit estimates for league ${league.id}`);
			const result = await Promise.all(bfitEstimatePromises);
			this.logger.log(result, `Updated bfit estimates for league ${league.id}`);
			return result;
		} catch (e) {
			this.logger.error(e, `FAILED bfit estimates for league ${league.id}`);
			throw e;
		}

	}
}
