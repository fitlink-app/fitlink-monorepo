import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useMe} from '@hooks';

const limit = 25;

const fetchLeagues = ({
  pageParam = 0,
  query,
  isPrivateOnly = false,
}: {
  pageParam?: number | undefined;
  query: string;
  isPrivateOnly: boolean;
}) =>
  // TODO: Implement in API SDK
  api.list<League>('/leagues/search', {
    page: pageParam,
    q: query,
    limit,
    leagueFilter: {
      isPublic: !isPrivateOnly,
    },
  });

export function useSearchLeagues(query: string) {
  const {data: user} = useMe({
    refetchOnMount: false,
  });
  const isPrivateOnly = Boolean(user?.teams.length);
  return useInfiniteQuery<ListResponse<League>, Error>(
    [QueryKeys.SearchLeagues, query, isPrivateOnly],
    ({pageParam}) => fetchLeagues({pageParam, query, isPrivateOnly}),
    {
      enabled: false,
      cacheTime: 0,
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
