import { ValidationOptions } from 'class-validator'
/**
 * Validates whether the given string contains lat/lng and radius
 * in CSV format
 *
 * e.g.51.7520131,-1.2578499,5
 *
 * @param property
 * @param validationOptions
 * @returns
 */
export declare function IsGeoRadial(
  validationOptions?: ValidationOptions
): (object: any, propertyName: string) => void
