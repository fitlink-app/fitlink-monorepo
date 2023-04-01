import { Injectable, NestMiddleware } from '@nestjs/common';
import { CLIENT_ID } from './client-id';


@Injectable()
export class ClientIdMiddleware implements NestMiddleware {
	constructor() { }

	async use(req: any, res: any, next: () => void) {
		const clientId = req?.headers[CLIENT_ID] || 'Fitlink';
		if (!req) {
			// this happens in unit tests
			req = {} as Request;
		}
		req['client'] = clientId;
		next();
	}
}
