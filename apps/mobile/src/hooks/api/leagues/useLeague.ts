import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';

export function useLeague(leagueId: string) {
  return useQuery<League, Error>([QueryKeys.League, leagueId], () =>
    api.get<League>(`/leagues/${leagueId}`),
  );
}