import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';

type FlanksData = {
  results: LeaderboardEntry[];
};

export function useRank(leagueId: string) {
  return useQuery<FlanksData, Error>([QueryKeys.LeagueRank, leagueId], () =>
    api.get<FlanksData>(`/leagues/${leagueId}/rank`),
  );
}
