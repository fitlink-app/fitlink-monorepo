import {useMutation, InfiniteData} from 'react-query';
import api, {getErrors} from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getResultsFromPages} from 'utils/api';
import {FeedItem} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';
import {LikeParameters} from './types';

export function useLike() {
  return useMutation(
    (params: LikeParameters) => {
      return api.post(`/users/${params.userId}/feed/${params.feedItemId}/like`);
    },
    {
      onMutate: async params => {
        await queryClient.cancelQueries(QueryKeys.Feed);
        queryClient.setQueryData<InfiniteData<ListResponse<FeedItem>>>(
          QueryKeys.Feed,
          oldFeedItems =>
            addFeedItemLike(oldFeedItems, params.feedItemId, params.userId),
        );
      },
    },
  );
}

function addFeedItemLike(
  oldFeedItems: InfiniteData<ListResponse<FeedItem>> | undefined,
  feedItemId: string,
  myUserId: string,
): InfiniteData<ListResponse<FeedItem>> {
  const feedItems = getResultsFromPages<FeedItem>(oldFeedItems);
  const result = feedItems?.find(feedItem => feedItem.id === feedItemId);

  if (result) {
    let newLikes = [...(result.likes as UserPublic[])];

    const myUserInLikesArray = newLikes.find(user => user.id === myUserId);
    const me = queryClient.getQueryData(QueryKeys.Me) as UserPublic;

    if (!myUserInLikesArray && me) {
      newLikes.push(me);
      result.likes = newLikes;
    }
  }

  return oldFeedItems as InfiniteData<ListResponse<FeedItem>>;
}
