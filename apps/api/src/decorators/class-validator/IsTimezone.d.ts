import { ValidationOptions } from 'class-validator'
/**
 * Validates whether the given timezone string
 * can be parsed by date-fns-tz
 *
 * e.g. Europe/London
 *
 * @param property
 * @param validationOptions
 * @returns
 */
export declare function IsTimezone(
  validationOptions?: ValidationOptions
): (object: any, propertyName: string) => void
