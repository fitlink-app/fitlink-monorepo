import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {durationToCountDown} from '@utils';
import {intervalToDuration, formatDuration} from 'date-fns';

// import moment from 'moment';
// import momentDurationFormatSetup from 'moment-duration-format';
import numbro from 'numbro';
// import {HealthActivityType, UnitSystem} from '../types';

// momentDurationFormatSetup(moment as any);

const METERS_TO_YARD_MULTIPLIER = 1.0936;

/**
 * Returns the formatted time value of the activity eg.: 1:55/100m
 *
 * @param type Type of health activity eg.: 'run', 'swim'
 * @param distance Distance traveled in meters
 * @param duration Time taken for this activity in seconds
 * @param unitSystem Unit system preference of the user
 */
export const getSpeedValue = (
  sport: string,
  distance: number,
  duration: number,
  unitSystem: UnitSystem,
  asArray?: boolean,
) => {
  switch (sport) {
    case 'running':
    case 'walking': {
      // Return time per km or time per mile
      const distanceInYards = distance * METERS_TO_YARD_MULTIPLIER;

      const secondsPerDistance =
        duration /
        (unitSystem === 'metric' ? distance / 1000 : distanceInYards / 1760);

      const formattedDuration = durationToCountDown(
        intervalToDuration({start: 0, end: secondsPerDistance * 1000}),
      );

      if (!asArray)
        return formattedDuration + (unitSystem === 'metric' ? '/km' : '/mile');

      return [formattedDuration, unitSystem === 'metric' ? '/km' : '/mile'];
    }

    case 'swimming': {
      // Return time per 100m or time per 100yrd
      const distanceInYards = distance * METERS_TO_YARD_MULTIPLIER;

      const secondsPerDistance =
        duration /
        (unitSystem === 'metric' ? distance / 100 : distanceInYards / 100);

      const formattedDuration = durationToCountDown(
        intervalToDuration({start: 0, end: secondsPerDistance * 1000}),
      );

      if (!asArray)
        return (
          formattedDuration + (unitSystem === 'metric' ? '/100m' : '/100yrd')
        );

      return [formattedDuration, unitSystem === 'metric' ? '/100m' : '/100yrd'];
    }

    default: {
      // Return km/h or mph
      const hours = duration / 60 / 60;
      const distanceInYards = distance * METERS_TO_YARD_MULTIPLIER;

      const speed =
        (unitSystem === 'metric' ? distance / 1000 : distanceInYards / 1760) /
        hours;

      const speedString = numbro(speed).format({
        trimMantissa: true,
        mantissa: 1,
      });

      if (!asArray)
        return speedString + (unitSystem === 'metric' ? 'km/h' : 'mph');

      return [speedString, unitSystem === 'metric' ? 'km/h' : 'mph'];
    }
  }
};

/**
 * Returns the distance as a formatted text with either km or mi based on user preferences
 * @param meters Distance traveled in meters
 * @param unitSystem Unit system preference of the user
 */
export const getActivityDistance = (
  unitSystem: UnitSystem,
  meters: number,
  options?: {
    asArray?: boolean;
    short?: boolean;
  },
) => {
  let yards = meters * 1.0936133;

  const kmValue = numbro(meters / 1000).format({
    trimMantissa: true,
    mantissa: 2,
  });

  const mileValue = numbro(yards / 1760).format({
    trimMantissa: true,
    mantissa: 2,
  });

  const imperialResult = [mileValue, options?.short ? 'mi' : 'miles'];
  const metricResult = [kmValue, options?.short ? 'km' : 'kilometers'];

  if (!options?.asArray) {
    switch (unitSystem) {
      case 'metric':
        return `${metricResult[0]} ${metricResult[1]}`;
      default:
        return `${imperialResult[0]} ${imperialResult[1]}`;
    }
  }

  switch (unitSystem) {
    case 'metric':
      return metricResult;
    default:
      return imperialResult;
  }
};
