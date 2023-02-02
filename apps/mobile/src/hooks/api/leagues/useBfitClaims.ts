import {useInfiniteQuery} from 'react-query';

import api from '@api';
import {LeagueBfitClaim} from '@fitlink/api/src/modules/leagues/entities/bfit-claim.entity';
import {ListResponse} from '@fitlink/api-sdk/types';
import {QueryKeys} from '@query';

import {getNextPageParam} from '../../../utils/api';

const limit = 10;

export type ExtendedLeagueBfitClaim = LeagueBfitClaim & {
  leagueName: string;
};

const fetchBfitClaims = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<ExtendedLeagueBfitClaim>('/leagues/bfit/claims', {
    page: pageParam,
    limit,
  });

export function useBfitClaims() {
  return useInfiniteQuery<ListResponse<ExtendedLeagueBfitClaim>, Error>(
    [QueryKeys.BfitClaims],
    ({pageParam}) => fetchBfitClaims({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
