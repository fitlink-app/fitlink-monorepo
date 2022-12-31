import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {FeedItem} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {FeedFilterDto} from '@fitlink/api/src/modules/feed-items/dto/feed-filter.dto';

const limit = 20;

const fetchFeed = ({
  pageParam = 0,
  dto,
}: {
  pageParam?: number | undefined;
  dto: FeedFilterDto;
}) => {
  return api.list<FeedItem>(`/me/feed`, {
    page: pageParam,
    limit,
    ...dto,
  });
};

export function useFeed(dto: FeedFilterDto) {
  return useInfiniteQuery<ListResponse<FeedItem>, Error>(
    QueryKeys.Feed,
    ({pageParam}) => fetchFeed({pageParam, dto}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
