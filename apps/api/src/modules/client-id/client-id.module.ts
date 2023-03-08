import { Module, DynamicModule, BadRequestException, Scope } from '@nestjs/common';
import { CLIENT_ID } from './client-id';
import { REQUEST } from '@nestjs/core';

@Module({})
export class ClientIdContextModule {
	static forRoot(): DynamicModule {


		return {
			module: ClientIdContextModule,
			providers: [
				{
					provide: CLIENT_ID,
					scope: Scope.REQUEST,
					useFactory: (req: Request) => {
						return req.headers['X-CLIENT-ID'] || 'Fitlink';
					},
					inject: [REQUEST],
				}
			],
			exports: [],
		};
	}

	static forFeature(): DynamicModule {
		return {
			module: ClientIdContextModule,
			providers: [],
		};
	}
}