import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {CreateActivityDto} from '@fitlink/api/src/modules/activities/dto/create-activity.dto';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';

export function useCreateActivity() {
  return useMutation(
    (dto: CreateActivityDto) =>
      api.post<Activity>(`/activities`, {payload: dto} as any),
    {
      onSuccess: () => {
        // Invalidate Activities
        queryClient.invalidateQueries(QueryKeys.SearchActivities, {
          refetchInactive: true,
        });

        // Invalidate Activities for Map
        queryClient.invalidateQueries(QueryKeys.SearchActivitiesMap, {
          refetchInactive: true,
        });

        // Invalidate My Activities
        queryClient.invalidateQueries(QueryKeys.MyActivities, {
          refetchInactive: true,
        });
      },
    },
  );
}
