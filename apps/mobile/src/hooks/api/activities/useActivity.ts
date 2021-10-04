import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';

export function useActivity(activityId?: string) {
  return useQuery<Activity, Error>(
    [QueryKeys.Activity, activityId],
    () => api.get<Activity>(`/activities/${activityId}`),
    {
      // Query is disabled until a leagueId is provided (for dependent queries)
      enabled: !!activityId,
    },
  );
}
