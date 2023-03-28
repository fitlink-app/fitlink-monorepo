import {useQuery, UseQueryOptions} from 'react-query';

import api from '@api';
import {QueryKeys} from '@query';
import {LeagueWaitlistUser} from '@fitlink/api/src/modules/leagues/entities/league-waitlist-user.entity';

export function useWaitList(options?: UseQueryOptions<LeagueWaitlistUser>) {
  return useQuery<LeagueWaitlistUser>(
    QueryKeys.Waitlist,
    () => api.get<LeagueWaitlistUser>('/me/leagues/waitlists'),
    {
      ...options,
    },
  );
}
