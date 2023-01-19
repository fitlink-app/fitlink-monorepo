import {useInfiniteQuery} from 'react-query';

import api from '@api';
import {LeagueBfitClaim} from '@fitlink/api/src/modules/leagues/entities/bfit-claim.entity';
import {ListResponse} from '@fitlink/api-sdk/types';
import {QueryKeys} from '@query';

import {getNextPageParam} from '../../../utils/api';

const limit = 10;

const claimBfit = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<LeagueBfitClaim>('/leagues/bfit/claims', {
    page: pageParam,
    limit,
  });

export function useClaimBfit() {
  return useInfiniteQuery<ListResponse<LeagueBfitClaim>, Error>(
    [QueryKeys.CteLeagues],
    ({pageParam}) => claimBfit({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
