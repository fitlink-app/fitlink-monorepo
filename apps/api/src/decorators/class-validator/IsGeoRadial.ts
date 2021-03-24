import { registerDecorator, ValidationOptions } from 'class-validator'

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
export function IsGeoRadial(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isGeoRadial',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: "geo_radial must be formatted correctly as 'lat,lng,radius'",
        ...validationOptions
      },
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            const parts = value.split(',')
            const lat = parseFloat(parts[0])
            const lng = parseFloat(parts[1])
            const rad = parseFloat(parts[2])
            return (
              lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && rad >= 0.1
            )
          } else {
            return false
          }
        }
      }
    })
  }
}
