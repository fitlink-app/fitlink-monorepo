import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { sanitize, Sanitized } from "../helpers/sanitize";
import axios from "axios";

@Injectable()
export class StripPasswordInterceptor implements NestInterceptor {
	private readonly logger = new Logger(StripPasswordInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<Sanitized<any>> {
		const request = context.switchToHttp().getRequest();
		return next.handle().pipe(
			map((data) => {
				// we needed to track the change because if nothing changed and we return the result, it can broken admin and this is too urgent to find out way
				const [updated, changed] = sanitize(data, {
					logger: this.logger,
					contextText: `Processing ${request.method} request to ${request.url}`
				});
				if (changed) {
					try {
						this.notifySlack(request);
					} catch (e) {
						console.log('could not send message to slack: ', e)
					}

					return updated;
				}
				return data;
			})
		);
	}

	async notifySlack(request: any) {
		try {
			const response = await axios.post(process.env.SLACK_WEBHOOK_JOBS_URL,
				{
					text: `SECURITY ALERT (PASSWORD ENDPOINT LEAK): ${request.method} request to ${request.url}}`,
				}
			);
			console.log(response.data);
		} catch (e) {
			console.error(e);
		}
	}

}