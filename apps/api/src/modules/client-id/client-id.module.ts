import { Module, Scope } from '@nestjs/common';
import { CLIENT_ID } from './client-id';
import { REQUEST } from '@nestjs/core';

@Module({
	providers: [
		{
			provide: CLIENT_ID,
			scope: Scope.REQUEST,
			useFactory: (req: Request) => {
				// Null check due to unit testing and e2e
				return req?.headers['X-CLIENT-ID'] || 'Fitlink';
			},
			inject: [REQUEST],
		},
	],
	exports: [CLIENT_ID],
})
export class ClientIdContextModule {}