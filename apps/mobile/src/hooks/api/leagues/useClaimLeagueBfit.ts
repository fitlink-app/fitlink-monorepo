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
      onSuccess: (data, leagueId) => {
        queryClient.invalidateQueries([QueryKeys.LeagueMembersMe, leagueId]);
      },
    },
  );
}
