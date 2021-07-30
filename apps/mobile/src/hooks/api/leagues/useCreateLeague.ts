import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {CreateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/create-league.dto';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';

export function useCreateLeague() {
  return useMutation(
    (dto: CreateLeagueDto) =>
      api.post<LeaguePublic>(`/leagues`, {payload: dto} as any),
    {
      onSuccess: () => {
        // Invalidate Leagues
        queryClient.invalidateQueries(QueryKeys.Leagues);

        // Invalidate My Leagues
        queryClient.invalidateQueries(QueryKeys.MyLeagues);
      },
    },
  );
}
