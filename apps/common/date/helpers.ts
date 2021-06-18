import { endOfDay, startOfDay } from 'date-fns'
import { zonedTimeToUtc, getTimezoneOffset } from 'date-fns-tz'

/**
 * Converts a date to UTC and applies the timezone difference
 * to get the start of the day in the timezone as UTC. For example,
 * the start of the day in Africa/Johannesburg is 22:00 in UTC
 * (due to offset being +2)
 *
 * @param tz e.g. Europe/London
 * @param date (defaults to now)
 * @returns Date
 */
export function zonedStartOfDay(tz = 'Etc/UTC', date = new Date()) {
  return zonedTimeToUtc(startOfDay(date), tz)
}

/**
 * Converts a date to UTC and applies the timezone difference
 * to get the end of the day in the timezone as UTC. For example,
 * the start of the day in Africa/Johannesburg is 21:59:59pm in UTC
 * (due to offset being +2)
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
    return !!getTimezoneOffset(tz)
  } catch (e) {
    return false
  }
}
