import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { League } from '../leagues/entities/league.entity'
import { LeagueBfitEarnings } from '../leagues/entities/bfit-earnings.entity'
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity'
import { LeaderboardEntry } from '../leaderboard-entries/entities/leaderboard-entry.entity'
import { LeaguesModule } from '../leagues/leagues.module'
import { Leaderboard } from '../leaderboards/entities/leaderboard.entity'
import { SqsConsumerOptions, SqsOptions } from '@ssut/nestjs-sqs/dist/sqs.types'
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs'
import { BfitDistributionService } from './sqs.service'
import { QUEUE_NAME } from './sqs.constant'
import { HealthActivitiesModule } from '../health-activities/health-activities.module'
import { HealthActivity } from '../health-activities/entities/health-activity.entity'
import { GoalsEntriesModule } from '../goals-entries/goals-entries.module'

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			League,
			LeagueBfitEarnings,
			WalletTransaction,
			LeaderboardEntry,
			Leaderboard,
			HealthActivity
		]),
		ConfigModule,
		LeaguesModule,
		HealthActivitiesModule,
		GoalsEntriesModule,
		SqsModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				let config: SqsConsumerOptions = {
					queueUrl: configService.get('SQS_QUEUE_URL'),
					region: configService.get('SQS_REGION'),
					name: QUEUE_NAME,
				}
				if (configService.get('SQS_QUEUE_IS_DEV') != 'true') {
					config.sqs = new AWS.SQS({
						accessKeyId: configService.get('SQS_ACCESS_KEY_ID'),
						secretAccessKey: configService.get('SQS_SECRET_ACCESS_KEY'),
						region: configService.get('SQS_REGION'),
					})
				}
				return {
					consumers: [
						config
					]
				} as SqsOptions;
			}
		}),
	],
	controllers: [],
	providers: [
		BfitDistributionService
	],
	exports: [BfitDistributionService]
})
export class BfitDistributionModule { }
