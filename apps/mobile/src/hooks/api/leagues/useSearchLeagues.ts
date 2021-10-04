import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';

const limit = 25;

const fetchLeagues = ({
  pageParam = 0,
  query,
}: {
  pageParam?: number | undefined;
  query: string;
}) =>
  // TODO: Implement in API SDK
  api.list<League>(`/leagues/search`, {
    page: pageParam,
    q: query,
    limit,
  });

export function useSearchLeagues(query: string) {
  return useInfiniteQuery<ListResponse<League>, Error>(
    [QueryKeys.SearchLeagues, query],
    ({pageParam}) => fetchLeagues({pageParam, query}),
    {
      enabled: false,
      cacheTime: 0,
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
