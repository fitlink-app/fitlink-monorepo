import {useMutation} from 'react-query';
import api from '@api';
import {queryClient, QueryKeys} from '@query';
import {HealthActivity} from '@fitlink/api/src/modules/health-activities/entities/health-activity.entity';

interface UseHealthActivityImageParamsBase {
  activityId: string;
  imageId: string;
  images: string[];
}

export function useHealthActivityImage() {
  const addImageMutation = useMutation(
    ({
      activityId,
      images,
    }: Pick<UseHealthActivityImageParamsBase, 'activityId' | 'images'>) =>
      api.post(`/me/health-activities/${activityId}/images`, {
        payload: {images},
      }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          QueryKeys.HealthActivity,
          variables.activityId,
        ]);

        queryClient.invalidateQueries(QueryKeys.Feed);
      },
    },
  );

  const deleteImageMutation = useMutation(
    ({
      activityId,
      imageId,
    }: Pick<UseHealthActivityImageParamsBase, 'activityId' | 'imageId'>) =>
      api.delete(`/me/health-activities/${activityId}/images/${imageId}`),
    {
      onMutate: ({activityId, imageId}) => {
        queryClient.setQueryData<HealthActivity>(
          [QueryKeys.HealthActivity, activityId],
          oldHealthActivity => ({
            ...oldHealthActivity!,
            images: oldHealthActivity!.images.filter(
              image => image.id !== imageId,
            ),
          }),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKeys.Feed);
      },
    },
  );

  return {
    addImageMutation,
    deleteImageMutation,
  };
}
