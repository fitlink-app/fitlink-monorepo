import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';

const limit = 25;

const fetchUsers = ({
  pageParam = 0,
  query,
}: {
  pageParam?: number | undefined;
  query: string;
}) =>
  api.list<UserPublic>(`/users/search`, {
    page: pageParam,
    q: query,
    limit,
  });

export function useSearchUsers(query: string) {
  return useInfiniteQuery<ListResponse<UserPublic>, Error>(
    [QueryKeys.SearchUsers, query],
    ({pageParam}) => fetchUsers({pageParam, query}),
    {
      enabled: false,
      cacheTime: 0,
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
