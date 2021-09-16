import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';

const limit = 25;

const fetchMyLeagues = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<League>(`/me/leagues`, {
    page: pageParam,
    limit,
  });

export function useMyLeagues() {
  return useInfiniteQuery<ListResponse<League>, Error>(
    QueryKeys.MyLeagues,
    ({pageParam}) => fetchMyLeagues({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
