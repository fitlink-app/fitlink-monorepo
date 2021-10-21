import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {HealthActivity} from '@fitlink/api/src/modules/health-activities/entities/health-activity.entity';

export function useHealthActivity(healthActivityId: string, enabled: boolean) {
  return useQuery<HealthActivity, Error>(
    [QueryKeys.HealthActivity, healthActivityId],
    () => api.get<HealthActivity>(`/health-activities/${healthActivityId}`),
    {enabled},
  );
}
