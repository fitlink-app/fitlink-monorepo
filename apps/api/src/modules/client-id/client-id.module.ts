import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { CLIENT_ID } from './client-id';
import { ClientIdMiddleware } from './client-id.middleware';
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
		return clientId;
	},
	inject: [REQUEST],
	// durable: true
}

@Module({
	exports: [CLIENT_ID],
	providers: [ClientIdMiddleware, clientFactory],
})
export class ClientIdContextModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(ClientIdMiddleware)
	}
	// configure(consumer: MiddlewareConsumer) {
	// 	// throw new Error('Method not implemented.');
	// }
}