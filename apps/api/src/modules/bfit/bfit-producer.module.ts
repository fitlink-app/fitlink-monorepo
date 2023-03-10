import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SqsOptions } from '@ssut/nestjs-sqs/dist/sqs.types'
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs'
import { QUEUE_NAME } from './bfit.constant'
import { BfitDistributionSenderService } from './bfit-producer.service'

@Module({
	imports: [
		ConfigModule,
		SqsModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return {
					producers: [
						{
							queueUrl: configService.get('SQS_QUEUE_URL'),
							region: configService.get('SQS_REGION'),
							name: QUEUE_NAME,
							sqs: new AWS.SQS({
								accessKeyId: configService.get('SQS_ACCESS_KEY_ID'),
								secretAccessKey: configService.get('SQS_SECRET_ACCESS_KEY'),
								region: configService.get('SQS_REGION'),
							}),
						}
					],
				} as SqsOptions;
			}
		}),
	],
	controllers: [],
	providers: [
		BfitDistributionSenderService
	],
	exports: [BfitDistributionSenderService]
})
export class BfitDistributionProducerModule { }
