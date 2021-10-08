import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {FeedItem} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';

const limit = 10;

const fetchFeed = ({pageParam = 0}: {pageParam?: number | undefined}) => {
  return api.list<FeedItem>(`/me/feed`, {
    page: pageParam,
    limit,
  });
};

export function useFeed() {
  return useInfiniteQuery<ListResponse<FeedItem>, Error>(
    QueryKeys.Feed,
    ({pageParam}) => fetchFeed({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
