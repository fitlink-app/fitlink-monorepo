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
		if (type === SQSTypes.steps) {
			return this.updateLeagueBfit(userId, 'steps')
		} else if (type === SQSTypes.sport) {
			return this.updateLeagueBfit(userId, additionalInfo.sport.name_key)
		} else if (type === SQSTypes.points) {
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
			throw leagueErr;
		}

		if (!league.active_leaderboard.entries) {
			throw new Error(`No entries found for league ${league.id}`);
		}

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

		const bfitEstimatePromises = [];
		// we want to double check this users that triggered the recount has earned points
		let hasUserEntry = false;
		for (const entry of league.active_leaderboard.entries) {
			if (entry.user_id === userId) {
				hasUserEntry = true;
			}

			const bfitEstimate = (league.bfitAllocation * (entry.points / totalLeaguePoints)) * 1000_000;
			if (bfitEstimate === 0 && entry.bfit_estimate === 0) {
				continue;
			}
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
}
