import {useInfiniteQuery} from 'react-query';

import api from '@api';
import {QueryKeys} from '@query';
import {ListResponse} from '@fitlink/api-sdk/types';
import {LeagueWithDailyBfit} from '@fitlink/api/src/modules/leagues/entities/league.entity';

import {getNextPageParam} from 'utils/api';

const limit = 10;

const fetchCteLeagues = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<LeagueWithDailyBfit>('/leagues/access/compete-to-earn', {
    page: pageParam,
    limit,
  });

export function useCteLeagues() {
  return useInfiniteQuery<ListResponse<LeagueWithDailyBfit>, Error>(
    [QueryKeys.CteLeagues],
    ({pageParam}) => fetchCteLeagues({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
