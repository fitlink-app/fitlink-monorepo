import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {UpdateActivityDto} from '@fitlink/api/src/modules/activities/dto/update-activity.dto';
import {Activity} from '@fitlink/api/src/modules/activities/entities/activity.entity';

type EditActivityParams = {
  id: string;
  dto: UpdateActivityDto;
};

export function useEditActivity() {
  return useMutation(
    (params: EditActivityParams) =>
      api.put<Activity>(`/activities/${params.id}`, {
        payload: params.dto,
      } as any),
    {
      onSuccess: (data, params) => {
        // Invalidate Activity
        queryClient.invalidateQueries([QueryKeys.Activity, params.id]);

        // Invalidate Activities
        queryClient.invalidateQueries(QueryKeys.SearchActivities, {
          refetchInactive: true,
        });

        // Invalidate Activities for Map
        queryClient.invalidateQueries(QueryKeys.SearchActivitiesMap, {
          refetchInactive: true,
        });

        // Invalidate My Activities
        queryClient.invalidateQueries(QueryKeys.MyActivities);
      },
    },
  );
}
