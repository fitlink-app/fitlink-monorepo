import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { sanitize, Sanitized } from "../helpers/sanitize";

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
				return changed ? updated : data;
			})
		);
	}
}