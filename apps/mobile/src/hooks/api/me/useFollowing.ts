import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';

const limit = 10;

const fetchFollowedUsers = ({
  pageParam = 0,
}: {
  pageParam?: number | undefined;
}) =>
  api.list<UserPublic>(`/me/following`, {
    page: pageParam,
    limit,
  });

export function useFollowing() {
  return useInfiniteQuery<ListResponse<UserPublic>, Error>(
    QueryKeys.Following,
    ({pageParam}) => fetchFollowedUsers({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
