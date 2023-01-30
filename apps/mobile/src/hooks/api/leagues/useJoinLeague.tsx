import {queryClient, QueryKeys} from '@query';
import {useMutation, InfiniteData} from 'react-query';
import api from '@api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {ListResponse} from '../../../../../api-sdk/types';
import {getResultsFromPages} from 'utils/api';

export function useJoinLeague() {
  // TODO: Fix in API SDK
  return useMutation((id: string) => api.post<any>(`/leagues/${id}/join`), {
    onSuccess: (data, leagueId) => {
      // Mutate League
      queryClient.setQueryData<League>(
        [QueryKeys.League, leagueId],
        oldLeague =>
          ({
            ...oldLeague,
            participating: true,
            participants_total: (oldLeague?.participants_total || 0) + 1,
          } as League),
      );

      // Mutate Leagues
      queryClient.setQueryData<InfiniteData<ListResponse<League>>>(
        QueryKeys.Leagues,
        oldLeagues => mutateLeagueListOnJoin(oldLeagues, leagueId),
      );

      // Mutate League Search
      queryClient.setQueriesData<InfiniteData<ListResponse<League>>>(
        QueryKeys.SearchLeagues,
        oldLeagues => mutateLeagueListOnJoin(oldLeagues, leagueId),
      );

      // Invalidate My Leagues
      queryClient.invalidateQueries(QueryKeys.MyLeagues);

      // Invalidate leaderboard
      queryClient.invalidateQueries([QueryKeys.LeagueMembers, leagueId]);

      // Invalidate Leaderboard Flanks
      queryClient.invalidateQueries([QueryKeys.LeagueRank, leagueId]);

      // Mutate League Invitations
      // TODO
      queryClient.invalidateQueries([QueryKeys.LeagueMembersMe, leagueId]);
    },
  });
}

function mutateLeagueListOnJoin(
  oldLeagues: InfiniteData<ListResponse<League>> | undefined,
  leagueId: string,
): InfiniteData<ListResponse<League>> {
  const leagues = getResultsFromPages<League>(oldLeagues);
  const result = leagues?.find(league => league.id === leagueId);

  if (result) {
    result.participants_total++;
    result.participating = true;
  }

  return oldLeagues as InfiniteData<ListResponse<League>>;
}
