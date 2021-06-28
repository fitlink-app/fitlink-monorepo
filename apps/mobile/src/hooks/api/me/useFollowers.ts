import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';

const limit = 25;

const fetchFollowers = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<UserPublic>(`/me/followers`, {
    page: pageParam,
    limit,
  });

export function useFollowers() {
  return useInfiniteQuery<ListResponse<UserPublic>, Error>(
    QueryKeys.Followers,
    ({pageParam}) => fetchFollowers({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
