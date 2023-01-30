import api from '@api';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';
import {QueryKeys} from '@query';
import {useQuery} from 'react-query';

export function useLeagueMembersMe(leagueId: string, isMember: boolean) {
  return useQuery<LeaderboardEntry, Error>(
    [QueryKeys.LeagueMembersMe, leagueId],
    () => api.get<LeaderboardEntry>(`/leagues/${leagueId}/members/me`),
    {
      // Query is disabled until a leagueId is provided (for dependent queries)
      enabled: !!leagueId && !!isMember,
    },
  );
}
