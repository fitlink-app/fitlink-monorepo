import {queryClient, QueryKeys} from '@query';
import {useMutation, InfiniteData} from 'react-query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {
  Activity,
  ActivityForMap,
} from '@fitlink/api/src/modules/activities/entities/activity.entity';

export function useDeleteActivity() {
  return useMutation((id: string) => api.delete(`/activities/${id}`), {
    onMutate: id => {
      queryClient.setQueriesData<InfiniteData<ListResponse<Activity>>>(
        QueryKeys.MyActivities,
        oldActivities => removeActivityFromPages(oldActivities, id),
      );

      queryClient.setQueriesData<InfiniteData<ListResponse<Activity>>>(
        QueryKeys.SearchActivities,
        oldActivities => removeActivityFromPages(oldActivities, id),
      );

      queryClient.setQueriesData<ListResponse<ActivityForMap>>(
        QueryKeys.SearchActivitiesMap,
        oldActivities => {
          //@ts-ignore
          const result = oldActivities?.results.find(item => item.id === id);

          if (result) {
            const index = oldActivities?.results.indexOf(result);

            if (index !== -1) {
              //@ts-ignore
              oldActivities?.results.splice(index, 1);
            }
          }

          return oldActivities as ListResponse<ActivityForMap>;
        },
      );
    },
    onSuccess: (data, id) => {
      // Invalidate Activity
      queryClient.invalidateQueries([QueryKeys.Activity, id]);

      // Invalidate Activities
      queryClient.invalidateQueries(QueryKeys.SearchActivities, {
        refetchInactive: true,
      });

      // Invalidate Activities for Map
      queryClient.invalidateQueries(QueryKeys.SearchActivitiesMap, {
        refetchInactive: true,
      });
    },
  });
}

function removeActivityFromPages<Activity>(
  oldActivities: InfiniteData<ListResponse<Activity>> | undefined,
  activityId: string,
) {
  for (const page of oldActivities?.pages || []) {
    const result = page.results.find(item => item.id === activityId);

    if (result) {
      const index = page.results.indexOf(result);

      if (index !== -1) {
        page.results.splice(index, 1);
      }
    }
  }

  return oldActivities as InfiniteData<ListResponse<Activity>>;
}
