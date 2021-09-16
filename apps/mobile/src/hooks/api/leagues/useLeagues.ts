import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';

const limit = 25;

const fetchLeagues = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<League>(`/leagues`, {
    page: pageParam,
    limit,
  });

export function useLeagues() {
  return useInfiniteQuery<ListResponse<League>, Error>(
    QueryKeys.Leagues,
    ({pageParam}) => fetchLeagues({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
