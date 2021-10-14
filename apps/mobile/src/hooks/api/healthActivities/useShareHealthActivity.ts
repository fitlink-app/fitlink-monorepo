import {useMutation} from 'react-query';
import api from '@api';

export function useShareHealthActivity() {
  return useMutation(
    ({activityId, imageId}: {activityId: string; imageId?: string}) =>
      api.post(`/me/health-activities/${activityId}/share`, {
        payload: imageId ? {imageId} : {nothing: ''},
      } as any),
  );
}
