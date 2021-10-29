import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {FeedItem} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';

const limit = 25;

const fetchUserFeed = ({
  pageParam = 0,
  userId,
}: {
  pageParam?: number | undefined;
  userId: string;
}) => {
  return api.list<FeedItem>(`/users/${userId}/feed`, {
    page: pageParam,
    limit,
  });
};

export function useUserFeed(userId: string) {
  return useInfiniteQuery<ListResponse<FeedItem>, Error>(
    [QueryKeys.UserFeed, userId],
    ({pageParam}) => fetchUserFeed({pageParam, userId}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
