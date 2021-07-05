import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';

const limit = 15;

const fetchLeagueMembers = ({
  pageParam = 0,
  leagueId,
}: {
  pageParam?: number | undefined;
  leagueId: string;
}) =>
  api.list<LeaderboardEntry>(`/leagues/${leagueId}/members`, {
    page: pageParam,
    limit,
  });

export function useLeagueMembers(leagueId: string) {
  return useInfiniteQuery<ListResponse<LeaderboardEntry>, Error>(
    [QueryKeys.LeagueMembers, leagueId],
    ({pageParam}) => fetchLeagueMembers({pageParam, leagueId}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
