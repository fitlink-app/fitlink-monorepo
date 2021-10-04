import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {GoalsEntry} from '@fitlink/api/src/modules/goals-entries/entities/goals-entry.entity';

export function useGoals(
  options?: UseQueryOptions<GoalsEntry, Error, GoalsEntry, QueryKey>,
) {
  return useQuery<GoalsEntry, Error>(
    QueryKeys.MyGoals,
    () => api.get<GoalsEntry>('/me/goals'),
    options,
  );
}
