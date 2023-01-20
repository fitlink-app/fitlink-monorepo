import {HealthActivity} from '@fitlink/api/src/modules/health-activities/entities/health-activity.entity';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {
  formatDateWithoutOffset,
  formatDistanceShortLocale,
  getActivityDistance,
  getSpeedValue,
} from '@utils';
import {formatDistanceStrict} from 'date-fns';
import locale from 'date-fns/locale/en-US';

export const useActivityInfoData = (
  data: HealthActivity | undefined,
  user: User | undefined,
) => {
  const distance =
    user && data?.distance
      ? (getActivityDistance(user.unit_system, data.distance, {
          short: true,
        }) as string)
      : undefined;

  const durationInSeconds = data
    ? (new Date(data.end_time).valueOf() -
        new Date(data.start_time).valueOf()) /
      1000
    : undefined;

  const speed =
    data?.distance && user && durationInSeconds
      ? (getSpeedValue(
          data.sport?.name_key,
          data.distance,
          data.active_time || durationInSeconds,
          user.unit_system,
        ) as string)
      : undefined;

  const elevation = data?.elevation
    ? user?.unit_system === UnitSystem.Metric
      ? `${Math.round(data?.elevation)} meters`
      : `${Math.round(data?.elevation * 3.2808399)} ft`
    : undefined;

  const calories = data?.calories
    ? Math.floor(data?.calories).toString()
    : undefined;

  const time = data
    ? formatDistanceStrict(new Date(data.start_time), new Date(data.end_time), {
        locale: {
          ...locale,
          formatDistance: formatDistanceShortLocale,
        },
      })
    : undefined;

  const date = data
    ? formatDateWithoutOffset(
        new Date(
          new Date(data.start_time).valueOf() + (data?.utc_offset || 0) * 1000,
        ),
        new Date(Date.now() + (data?.utc_offset || 0) * 1000),
      )
    : '';
  return {
    details: [
      {title: 'Distance', value: distance},
      {title: 'Speed', value: speed},
      {title: 'Calories', value: calories},
      {title: 'Time', value: time},
      {title: 'Elevation Gain', value: elevation},
    ].filter(({value}) => !!value),
    title: data?.sport.name,
    date,
    userName: data?.user.name,
    images: data?.images.length
      ? data?.images.map(({url}) => url)
      : [data?.sport.image_url || ''],
  };
};
