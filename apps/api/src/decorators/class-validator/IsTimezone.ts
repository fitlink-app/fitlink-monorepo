import { registerDecorator, ValidationOptions } from 'class-validator'
import { isValidTimezone } from '../../../../common/date/helpers'

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
export function IsTimezone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isTimezone',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'timezone must be a valid timezone',
        ...validationOptions
      },
      validator: {
        validate(value: any) {
          if (typeof value === 'string') {
            return isValidTimezone(value)
          } else {
            return false
          }
        }
      }
    })
  }
}
