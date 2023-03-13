import { Injectable } from "@nestjs/common";
import { BfitActivityTypes } from "./bfit.types";
import { QUEUE_NAME } from "./bfit.constant";
import { SqsService } from "@ssut/nestjs-sqs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BfitDistributionSenderService {

	constructor(
		private readonly sqsService: SqsService,
		private readonly configService: ConfigService
	) { }

	sendToQueue(id: string, type: BfitActivityTypes, userId: string, additional?: Record<string, any>) {
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
		console.info(`Sending BFIT message to queue: ${JSON.stringify(message)}`);
		this.sqsService.send(QUEUE_NAME, message)
	}

}