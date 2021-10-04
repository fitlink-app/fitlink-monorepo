import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {UpdateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/update-league.dto';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';

type EditLeagueParams = {
  id: string;
  dto: UpdateLeagueDto;
};

export function useEditLeague() {
  return useMutation(
    (params: EditLeagueParams) =>
      api.put<LeaguePublic>(`/leagues/${params.id}`, {
        payload: params.dto,
      } as any),
    {
      onMutate: params => {
        // Mutate League
        queryClient.setQueryData<League>(
          [QueryKeys.League, params.id],
          oldLeague =>
            ({
              ...oldLeague,
              ...params.dto,
            } as League),
        );
      },
      onSuccess: (data, params) => {
        queryClient.invalidateQueries([QueryKeys.League, params.id]);

        // Invalidate Leagues
        queryClient.invalidateQueries(QueryKeys.Leagues);

        // Invalidate My Leagues
        queryClient.invalidateQueries(QueryKeys.MyLeagues);
      },
    },
  );
}
