import api from '@api';
import {QueryKeys} from '@query';
import {useQuery, UseQueryOptions} from 'react-query';

export type OnWaitListResponse = {waitlist: boolean};

export function useOnWaitList(
  leagueId: string,
  options?: UseQueryOptions<OnWaitListResponse>,
) {
  return useQuery<OnWaitListResponse>(
    QueryKeys.OnWaitlist,
    () => api.get<OnWaitListResponse>(`/leagues/${leagueId}/onwaitlist`),
    {
      ...options,
    },
  );
}
