import {queryClient, QueryKeys} from '@query';
import {useMutation, InfiniteData} from 'react-query';
import api from '@api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {ListResponse} from '../../../../../api-sdk/types';
import {getResultsFromPages} from 'utils/api';

export function useLeaveLeague() {
  // TODO: Fix in API SDK
  return useMutation((id: string) => api.post<any>(`/leagues/${id}/leave`), {
    onSuccess: (data, leagueId) => {
      // Mutate League
      queryClient.setQueryData<League>(
        [QueryKeys.League, leagueId],
        oldLeague =>
          ({
            ...oldLeague,
            participating: false,
            participants_total: (oldLeague?.participants_total || 0) - 1,
          } as League),
      );

      // Mutate Leagues
      queryClient.setQueryData<InfiniteData<ListResponse<League>>>(
        QueryKeys.Leagues,
        oldLeagues => mutateLeagueListOnLeave(oldLeagues, leagueId),
      );

      // Mutate League Search
      queryClient.setQueriesData<InfiniteData<ListResponse<League>>>(
        QueryKeys.SearchLeagues,
        oldLeagues => mutateLeagueListOnLeave(oldLeagues, leagueId),
      );

      // Mutate My Leagues
      queryClient.setQueriesData<InfiniteData<ListResponse<League>>>(
        QueryKeys.MyLeagues,
        oldLeagues => {
          if (oldLeagues && oldLeagues.pages.length) {
            for (const page of oldLeagues.pages) {
              const result = page.results.find(
                league => league.id === leagueId,
              );

              if (result) {
                const index = page.results.indexOf(result);
                page.results.splice(index, 1);
                break;
              }
            }
          }

          return oldLeagues as InfiniteData<ListResponse<League>>;
        },
      );
      // Mutate League Invitations
      // TODO

      // Invalidate leaderboard
      queryClient.invalidateQueries([QueryKeys.LeagueMembers, leagueId]);
    },
  });
}

function mutateLeagueListOnLeave(
  oldLeagues: InfiniteData<ListResponse<League>> | undefined,
  leagueId: string,
): InfiniteData<ListResponse<League>> {
  const leagues = getResultsFromPages<League>(oldLeagues);
  const result = leagues?.find(league => league.id === leagueId);

  if (result) {
    result.participants_total--;
    result.participating = false;
  }

  return oldLeagues as InfiniteData<ListResponse<League>>;
}
