import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';

const limit = 25;

const fetchMyActivities = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<Activity>(`/me/activities`, {
    page: pageParam,
    limit,
  });

export function useMyActivities() {
  return useInfiniteQuery<ListResponse<Activity>, Error>(
    QueryKeys.MyActivities,
    ({pageParam}) => fetchMyActivities({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
