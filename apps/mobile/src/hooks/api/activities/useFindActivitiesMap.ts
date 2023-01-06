import {QueryKeys} from '@query';
import {useQuery} from 'react-query';
import api from '@api';
import {FindActivitiesDto} from '@fitlink/api/src/modules/activities/dto/find-activities.dto';
import {ActivityForMap} from '@fitlink/api/src/modules/activities/entities/activity.entity';
import {ListResponse} from '../../../../../api-sdk/types';

interface FindActivitiesMapDto extends Pick<FindActivitiesDto, 'geo_radial'> {}

export function useFindActivitiesMap(dto: FindActivitiesMapDto) {
  return useQuery<ListResponse<ActivityForMap>, Error>(
    QueryKeys.SearchActivitiesMap,
    () => {
      const searchParams = new URLSearchParams();
      searchParams.append('geo_radial', String(dto.geo_radial));
      return api.get<ListResponse<ActivityForMap>>(
        `/activities/map?${searchParams}`,
      );
    },
    // {enabled: false},
  );
}
