import {useQuery} from 'react-query';
import {QueryKeys} from '@query';

import api from '@api';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';

export function useLeague(leagueId?: string, disabled?: boolean) {
  return useQuery<LeaguePublic, Error>(
    [QueryKeys.League, leagueId],
    () => api.get<LeaguePublic>(`/leagues/${leagueId}`),
    {
      // Query is disabled until a leagueId is provided (for dependent queries)
      enabled: !!leagueId && !disabled,
    },
  );
}
