import api from '@api';
import {QueryKeys, queryClient} from '@query';
import {useMutation} from 'react-query';
import {ClaimLeagueBfitDto} from '@fitlink/api/src/modules/leagues/dto/claim-league-bfit.dto';

type ClaimLeagueBfitParams = {
  id: string;
  dto: ClaimLeagueBfitDto;
};

export function useClaimLeagueBfit() {
  // TODO: Fix in API SDK
  return useMutation(
    ({id, dto}: ClaimLeagueBfitParams) =>
      api.post<any>(`/leagues/${id}/claim`, {payload: dto}),
    {
      onSuccess: (data, {id}) => {
        queryClient.invalidateQueries([QueryKeys.LeagueMembersMe, id]);
        queryClient.invalidateQueries([QueryKeys.League, id]);
        queryClient.invalidateQueries(QueryKeys.CteLeagues);
        queryClient.invalidateQueries(QueryKeys.Me);
      },
    },
  );
}
