import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';

const limit = 10;

const fetchCteLeagues = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<League>('/leagues/access/compete-to-earn', {
    page: pageParam,
    limit,
  });

export function useCteLeagues() {
  return useInfiniteQuery<ListResponse<League>, Error>(
    [QueryKeys.CteLeagues],
    ({pageParam}) => fetchCteLeagues({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
