import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {FindActivitiesDto} from '@fitlink/api/src/modules/activities/dto/find-activities.dto';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';

const limit = 50;

interface FetchActivitiesDto
  extends Omit<FindActivitiesDto, 'page' | 'limit'> {}

const fetchActivities = ({
  pageParam = 0,
  dto,
}: {
  pageParam?: number | undefined;
  dto: FetchActivitiesDto;
}) =>
  api.list<Activity>(`/activities`, {
    page: pageParam,
    limit,
    ...dto,
  });

export function useFindActivities(dto: FetchActivitiesDto) {
  return useInfiniteQuery<ListResponse<Activity>, Error>(
    QueryKeys.SearchActivities,
    ({pageParam}) => fetchActivities({pageParam, dto}),
    {
      getNextPageParam: (lastPage, pages) => pages.length + 1,
      enabled: false,
    },
  );
}
