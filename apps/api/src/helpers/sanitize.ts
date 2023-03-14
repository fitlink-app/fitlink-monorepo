import { Logger } from "@nestjs/common";

type ObjectWithoutPassword<T> = {
	[K in keyof T]: T[K] extends object
	? ObjectWithoutPassword<T[K]>
	: K extends `${infer Prefix}password${infer Suffix}`
	? never
	: T[K];
};
type SanitizedArray<T> = Sanitized<T>[];
type SanitizedObjectWithoutPassword<T> = {
	[K in keyof ObjectWithoutPassword<T>]: Sanitized<ObjectWithoutPassword<T>[K]>;
};
type SanitizedObject<T> = T extends { password: any }
	? SanitizedObjectWithoutPassword<Omit<T, 'password'>>
	: SanitizedObjectWithoutPassword<T>;
export type Sanitized<T> = T extends (infer U)[]
	? SanitizedArray<U>
	: SanitizedObject<T>;

export function sanitize<T extends Record<string, any>>(data: T, options?: { logger?: Logger, contextText?: string }): [Sanitized<T>, boolean] {
	const result = {} as any;
	let changed = false;

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

			if (typeof value === 'object' && value !== null) {
				if (Array.isArray(value)) {
					const [sanitizedArray, arrayChanged] = sanitize(value, options);
					if (arrayChanged) {
						changed = true;
					}
					result[key] = sanitizedArray;
				} else if ('length' in value) {
					const [sanitizedArray, arrayChanged] = sanitize(Array.from(value), options);
					if (arrayChanged) {
						changed = true;
					}
					result[key] = sanitizedArray;
				} else if ((value as any) instanceof Date) {
					result[key] = value;
				} else {
					const [sanitizedObject, objectChanged] = sanitize(value, options);
					if (objectChanged) {
						changed = true;
					}
					result[key] = sanitizedObject;
				}

				if (typeof key === 'string' && /password/i.test(key)) {
					if (options.logger) {
						options.logger.warn(
							`${options.contextText ? `${options.contextText} - ` : ''}Removing password from ${key}`
						);
					} else if (options.contextText) {
						console.warn(`${options.contextText} - Removing password from ${key}`);
					}
					delete result[key];
					delete data[key];
					changed = true;
				}
			} else {
				if (typeof key === 'string' && /password/i.test(key)) {
					if (options.logger) {
						options.logger.warn(
							`${options.contextText ? `${options.contextText} - ` : ''}Removing password from ${key}`
						);
					} else if (options.contextText) {
						console.warn(`${options.contextText} - Removing password from ${key}`);
					}
					delete result[key];
					delete data[key];
					changed = true;
				} else {
					result[key] = value;
				}
			}
		}
	}

	return [result, changed];
}