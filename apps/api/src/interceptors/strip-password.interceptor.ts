import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { sanitize, Sanitized } from "../helpers/sanitize";

export interface ObjectDiff {
	added: {} | ObjectDiff;
	updated: {
		[propName: string]: Update | ObjectDiff;
	};
	removed: {} | ObjectDiff;
	unchanged: {} | ObjectDiff;
}

export interface Update {
	oldValue: any;
	newValue: any;
}


export class ObjectUtils {
	/**
	 * @return if obj is an Object, including an Array.
	 */
	static isObject(obj: any) {
		return obj !== null && typeof obj === 'object';
	}

	/**
	 * @param oldObj The previous Object or Array.
	 * @param newObj The new Object or Array.
	 * @param deep If the comparison must be performed deeper than 1st-level properties.
	 * @return A difference summary between the two objects.
	 */
	static diff(oldObj: {}, newObj: {}, deep = false): ObjectDiff {
		const added = {};
		const updated = {};
		const removed = {};
		const unchanged = {};
		for (const oldProp in oldObj) {
			if (oldObj.hasOwnProperty(oldProp)) {
				const newPropValue = newObj[oldProp];
				const oldPropValue = oldObj[oldProp];
				if (newObj.hasOwnProperty(oldProp)) {
					if (newPropValue === oldPropValue) {
						unchanged[oldProp] = oldPropValue;
					} else {
						updated[oldProp] = deep && this.isObject(oldPropValue) && this.isObject(newPropValue) ? this.diff(oldPropValue, newPropValue, deep) : { newValue: newPropValue };
					}
				} else {
					removed[oldProp] = oldPropValue;
				}
			}
		}
		for (const newProp in newObj) {
			if (newObj.hasOwnProperty(newProp)) {
				const oldPropValue = oldObj[newProp];
				const newPropValue = newObj[newProp];
				if (oldObj.hasOwnProperty(newProp)) {
					if (oldPropValue !== newPropValue) {
						if (!deep || !this.isObject(oldPropValue)) {
							updated[newProp].oldValue = oldPropValue;
						}
					}
				} else {
					added[newProp] = newPropValue;
				}
			}
		}
		return { added, updated, removed, unchanged };
	}
}

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