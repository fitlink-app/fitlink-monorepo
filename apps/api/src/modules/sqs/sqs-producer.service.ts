import { Injectable } from "@nestjs/common";
import { SQSTypes } from "./sqs.types";
import { QUEUE_NAME } from "./sqs.constant";
import { SqsService } from "@ssut/nestjs-sqs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SQSDistributionSenderService {

	constructor(
		private readonly sqsService: SqsService,
		private readonly configService: ConfigService
	) { }

	sendToQueue(id: string, type: SQSTypes, userId: string, additional?: Record<string, any>) {
		const groupId = this.configService.get('SQS_QUEUE_IS_DEV') == 'true' ? undefined : id;
		const message = {
			id,
			body: {
				type,
				userId: userId,
				...(additional ?? {}),
			},
			groupId: groupId,
		}
		this.sqsService.send(QUEUE_NAME, message)
	}

}