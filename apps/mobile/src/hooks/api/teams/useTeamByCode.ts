import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {Team} from '@fitlink/api/src/modules/teams/entities/team.entity';

export function useTeamByCode(
  code: string,
  options?: UseQueryOptions<Team, Error, Team, QueryKey>,
) {
  return useQuery<Team, Error>(
    QueryKeys.Me,
    () => api.get<Team>(`/teams/code/${code}`),
    {
      ...options,
    },
  );
}
