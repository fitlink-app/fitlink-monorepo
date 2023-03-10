import { Injectable } from "@nestjs/common";
import { BfitActivityTypes } from "./bfit.types";
import { QUEUE_NAME } from "./bfit.constant";
import { SqsService } from "@ssut/nestjs-sqs";

@Injectable()
export class BfitDistributionSenderService {

	constructor(
		private readonly sqsService: SqsService,
	) { }

	sendToQueue(id: string, type: BfitActivityTypes, userId: string, additional?: Record<string, any>) {
		this.sqsService.send(QUEUE_NAME, {
			id,
			body: {
				type,
				userId: userId,
				...(additional ?? {}),
			},
			groupId: id,
		})
	}

}