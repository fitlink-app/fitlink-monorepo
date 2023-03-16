import { BadRequestException, Module, Scope, SetMetadata } from '@nestjs/common';
import { CLIENT_ID } from './client-id';
import { REQUEST } from '@nestjs/core';

const clientFactory = {
	provide: CLIENT_ID,
	scope: Scope.REQUEST,
	useFactory: (req: Request) => {
		const clientId = req?.headers[CLIENT_ID] || 'Fitlink';
		if (!req) {
			// this happens in unit tests
			req = {} as Request;
		}
		req['client'] = clientId;
		return clientId;
	},
	inject: [REQUEST],
	// durable: true
}
@Module({
	providers: [
		clientFactory
	],
	exports: [CLIENT_ID],
})
export class ClientIdContextModule { }