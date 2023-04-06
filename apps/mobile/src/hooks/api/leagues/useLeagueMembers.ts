import {useInfiniteQuery, UseInfiniteQueryOptions} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';

import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {LeaderboardEntry} from '@fitlink/api/src/modules/leaderboard-entries/entities/leaderboard-entry.entity';

export const LEAGUE_MEMBERS_RESULTS_PER_PAGE = 25;

const fetchLeagueMembers = ({
  pageParam = 0,
  leagueId,
  orderBy = '',
}: {
  pageParam?: number | undefined;
  leagueId: string;
  orderBy?: string;
}) =>
  api.list<LeaderboardEntry>(`/leagues/${leagueId}/members`, {
    page: pageParam,
    limit: LEAGUE_MEMBERS_RESULTS_PER_PAGE,
    query: {
      orderBy,
    },
  });

type HookProps = {
  leagueId: string;
  options?: Omit<
    UseInfiniteQueryOptions<ListResponse<LeaderboardEntry>, Error>,
    'getNextPageParam'
  >;
  orderBy?: string;
};

export function useLeagueMembers({leagueId, orderBy, options}: HookProps) {
  return useInfiniteQuery<ListResponse<LeaderboardEntry>, Error>(
    [QueryKeys.LeagueMembers, leagueId, orderBy],
    ({pageParam}) => fetchLeagueMembers({orderBy, pageParam, leagueId}),
    {
      ...options,
      getNextPageParam: getNextPageParam(LEAGUE_MEMBERS_RESULTS_PER_PAGE),
    },
  );
}
