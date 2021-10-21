import { endOfDay, startOfDay } from 'date-fns'
import {
  zonedTimeToUtc,
  getTimezoneOffset,
  format,
  OptionsWithTZ
} from 'date-fns-tz'

/**
 * Converts a date to UTC and applies the timezone difference
 * to get the start of the day in the timezone as UTC. For example,
 * midnight in Africa/Johannesburg is 22:00 in UTC
 * (due to offset being +2)
 *
 * 2021-10-20T22:00:00.000Z | Thu Oct 21 2021 00:00:00 GMT+0200 (South Africa Standard Time) | Africa/Johannesburg
 * 2021-10-20T23:00:00.000Z | Thu Oct 21 2021 01:00:00 GMT+0200 (South Africa Standard Time) | Europe/Lisbon
 * 2021-10-20T23:00:00.000Z | Thu Oct 21 2021 01:00:00 GMT+0200 (South Africa Standard Time) | Europe/London
 * 2021-10-21T04:00:00.000Z | Thu Oct 21 2021 06:00:00 GMT+0200 (South Africa Standard Time) | America/New_York
 * 2021-10-21T00:00:00.000Z | Thu Oct 21 2021 02:00:00 GMT+0200 (South Africa Standard Time) | Etc/UTC
 *
 * Timezones that are invalid return as Etc/UTC
 *
 * @param tz e.g. Europe/London
 * @param date (defaults to now)
 * @returns Date
 */
export function zonedStartOfDay(tz = 'Etc/UTC', date = new Date()) {
  return zonedTimeToUtc(startOfDay(date), tz)
}

/**
 * Returns the date in the zone
 *
 * @param tz e.g. Europe/London
 * @param date (defaults to now)
 * @returns Date
 */
export function zonedFormat(
  date: Date,
  fm: string,
  timeZone: string = 'Etc/UTC',
  options?: OptionsWithTZ
) {
  return format(date, fm, {
    ...options,
    timeZone
  })
}

/**
 * Converts a date to UTC and applies the timezone difference
 * to get the end of the day in the timezone as UTC. For example,
 * the start of the day in Africa/Johannesburg is 21:59:59pm in UTC
 * (due to offset being +2)
 *
 * 2021-10-21T21:59:59.999Z | Thu Oct 21 2021 23:59:59 GMT+0200 (South Africa Standard Time) | Africa/Johannesburg
 * 2021-10-21T22:59:59.999Z | Fri Oct 22 2021 00:59:59 GMT+0200 (South Africa Standard Time) | Europe/Lisbon
 * 2021-10-21T22:59:59.999Z | Fri Oct 22 2021 00:59:59 GMT+0200 (South Africa Standard Time) | Europe/London
 * 2021-10-22T03:59:59.999Z | Fri Oct 22 2021 05:59:59 GMT+0200 (South Africa Standard Time) | America/New_York
 * 2021-10-21T23:59:59.999Z | Fri Oct 22 2021 01:59:59 GMT+0200 (South Africa Standard Time) | Etc/UTC
 *
 * @param tz e.g. Europe/London
 * @param date (defaults to now)
 * @returns Date
 */
export function zonedEndOfDay(tz = 'Etc/UTC', date = new Date()) {
  return zonedTimeToUtc(endOfDay(date), tz)
}

/**
 * Checks whether timezone string is valid
 * @param tz
 * @returns boolean
 */
export function isValidTimezone(tz: string) {
  try {
    return isNaN(getTimezoneOffset(tz)) === false
  } catch (e) {
    return false
  }
}

export function dateToTimezone() {}
