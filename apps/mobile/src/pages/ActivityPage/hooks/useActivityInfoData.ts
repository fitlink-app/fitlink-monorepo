import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {
  formatDateWithoutOffset,
  formatDistanceShortLocale,
  getActivityDistance,
  getSpeedValue,
} from '@utils';
import {formatDistanceStrict} from 'date-fns';
import locale from 'date-fns/locale/en-US';
import {useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import {useHealthActivity, useMe} from '@hooks';

export const useActivityInfoData = ({activityId}: {activityId: string}) => {
  const [areInteractionsDone, setInteractionsDone] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsDone(true);
    });
  }, []);

  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchMe,
    isRefetching: isRefetchingMe,
    isError: isErrorMe,
  } = useMe({
    refetchOnMount: false,
  });

  const {
    data,
    isLoading: isLoadingActivity,
    refetch: refetchActivity,
    isRefetching: isRefetchingActivity,
    isError: isActivityError,
  } = useHealthActivity(activityId, areInteractionsDone);

  const isContentLoaded = !!(data && user);
  const isLoading = isLoadingActivity || isLoadingUser;
  const isRefetching = isRefetchingActivity || isRefetchingMe;
  const isOwnedActivity = data?.user.id === user?.id;
  const isError = isErrorMe || isActivityError;

  const refetch = () => Promise.all([refetchMe(), refetchActivity()]);

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

  const details = [
    {title: 'Distance', value: distance},
    {title: 'Speed', value: speed},
    {title: 'Calories', value: calories},
    {title: 'Time', value: time},
    {title: 'Elevation Gain', value: elevation},
  ].filter(({value}) => !!value);

  const images = data?.images.length
    ? data?.images.map(({url}) => url)
    : [data?.sport.image_url || ''];

  return {
    data,
    date,
    images,
    details,
    title: data?.sport.name,
    userName: data?.user.name,
    isContentLoaded,
    isOwnedActivity,
    refetch,
    isLoading,
    isRefetching,
    isError,
  };
};
