import * as num from 'numbro'
import { formatDuration, intervalToDuration } from 'date-fns'

const numbro = num as any

const METERS_TO_YARD_MULTIPLIER = 1.0936

export type UnitSystem = 'imperial' | 'metric'

export const getActivityDistance = (
  unitSystem: UnitSystem,
  meters: number,
  options?: {
    asArray?: boolean
    short?: boolean
  }
) => {
  let yards = meters * 1.0936133

  const kmValue = numbro(meters / 1000).format({
    trimMantissa: true,
    mantissa: 2
  })

  const mileValue = numbro(yards / 1760).format({
    trimMantissa: true,
    mantissa: 2
  })

  const imperialResult =
    yards >= 1760
      ? [mileValue, options?.short ? 'mi' : 'miles']
      : [parseFloat(yards.toFixed(2)), options?.short ? 'yrds' : 'yards']
  const metricResult =
    meters >= 1000
      ? [kmValue, options?.short ? 'km' : 'kilometers']
      : [parseFloat(meters.toFixed(2)), options?.short ? 'm' : 'meters']

  if (!options?.asArray) {
    switch (unitSystem) {
      case 'metric':
        return `${metricResult[0]} ${metricResult[1]}`
      default:
        return `${imperialResult[0]} ${imperialResult[1]}`
    }
  }

  switch (unitSystem) {
    case 'metric':
      return metricResult
    default:
      return imperialResult
  }
}

export const getSpeedValue = (
  type: 'running' | 'walking' | 'swimming' | string,
  distance: number,
  duration: number,
  unitSystem: UnitSystem,
  asArray?: boolean
) => {
  switch (type) {
    case 'running':
    case 'walking': {
      // Return time per km or time per mile
      const distanceInYards = distance * METERS_TO_YARD_MULTIPLIER

      const secondsPerDistance =
        duration /
        (unitSystem === 'metric' ? distance / 1000 : distanceInYards / 1760)

      const formattedDuration = formatPaceDuration(secondsPerDistance)

      if (!asArray)
        return formattedDuration + (unitSystem === 'metric' ? '/km' : '/mile')

      return [formattedDuration, unitSystem === 'metric' ? '/km' : '/mile']
    }

    case 'swimming': {
      // Return time per 100m or time per 100yrd
      const distanceInYards = distance * METERS_TO_YARD_MULTIPLIER

      const secondsPerDistance =
        duration /
        (unitSystem === 'metric' ? distance / 100 : distanceInYards / 100)

      const formattedDuration = formatPaceDuration(secondsPerDistance)

      if (!asArray)
        return (
          formattedDuration + (unitSystem === 'metric' ? '/100m' : '/100yrd')
        )

      return [formattedDuration, unitSystem === 'metric' ? '/100m' : '/100yrd']
    }

    default: {
      // Return km/h or mph
      const hours = duration / 60 / 60
      const distanceInYards = distance * METERS_TO_YARD_MULTIPLIER

      const speed =
        (unitSystem === 'metric' ? distance / 1000 : distanceInYards / 1760) /
        hours

      const speedString = numbro(speed).format({
        trimMantissa: true,
        mantissa: 1
      })

      if (!asArray)
        return speedString + (unitSystem === 'metric' ? 'km/h' : 'mph')

      return [speedString, unitSystem === 'metric' ? 'km/h' : 'mph']
    }
  }
}

/**
 * Format duration in a short style eg.: 1h21m
 * @param duration duration in seconds
 */
export function formatDurationShort(duration: number) {
  return formatShortDuration(duration)
}

export const formatShortDuration = (seconds) => {
  const formatDistanceLocale = {
    xSeconds: '{{count}}s',
    xMinutes: '{{count}}m',
    xHours: '{{count}}h'
  }
  const shortEnLocale = {
    formatDistance: (token, count) =>
      formatDistanceLocale[token].replace('{{count}}', count)
  }
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    locale: shortEnLocale
  })
}

export const formatPaceDuration = (seconds) => {
  const formatDistanceLocale = { xSeconds: '{{count}}', xMinutes: '{{count}}' }
  const shortEnLocale = {
    formatDistance: (token, count) =>
      formatDistanceLocale[token].replace('{{count}}', count)
  }
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })
  return formatDuration(duration, {
    format: ['minutes', 'seconds'],
    locale: shortEnLocale,
    delimiter: ':',
    zero: true
  })
}
