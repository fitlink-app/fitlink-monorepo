import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SqsOptions, SqsProducerOptions } from '@ssut/nestjs-sqs/dist/sqs.types'
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs'
import { QUEUE_NAME } from './sqs.constant'
import { SQSDistributionSenderService } from './sqs-producer.service'

@Module({
	imports: [
		ConfigModule,
		SqsModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				let config: SqsProducerOptions = {
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
					producers: [
						config
					],
				} as SqsOptions;
			}
		}),
	],
	controllers: [],
	providers: [
		SQSDistributionSenderService
	],
	exports: [SQSDistributionSenderService]
})
export class SQSProducerModule { }
