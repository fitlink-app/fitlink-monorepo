import {useMutation, InfiniteData} from 'react-query';
import api, {getErrors} from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getResultsFromPages} from 'utils/api';
import {FeedItem} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';
import {LikeParameters} from './types';

export function useDislike() {
  return useMutation(
    (params: LikeParameters) =>
      api.delete(`/users/${params.userId}/feed/${params.feedItemId}/like`),
    {
      onMutate: async params => {
        await queryClient.cancelQueries(QueryKeys.Feed);
        // Remove self from likes of FeedItem
        // Mutate Followers
        queryClient.setQueryData<InfiniteData<ListResponse<FeedItem>>>(
          QueryKeys.Feed,
          oldFeedItems => deleteFeedItemLike(oldFeedItems, params.feedItemId),
        );

        queryClient.setQueryData<InfiniteData<ListResponse<FeedItem>>>(
          [QueryKeys.UserFeed, params.userId],
          oldFeedItems => deleteFeedItemLike(oldFeedItems, params.feedItemId),
        );
      },
    },
  );
}

function deleteFeedItemLike(
  oldFeedItems: InfiniteData<ListResponse<FeedItem>> | undefined,
  feedItemId: string,
): InfiniteData<ListResponse<FeedItem>> {
  const feedItems = getResultsFromPages<FeedItem>(oldFeedItems);
  const feedItem = feedItems?.find(feedItem => feedItem.id === feedItemId);

  if (feedItem) {
    let newLikes = [...(feedItem.likes as UserPublic[])];

    const me = queryClient.getQueryData(QueryKeys.Me) as UserPublic;
    const myUserInLikesArray = newLikes.find(user => user.id === me?.id);

    if (myUserInLikesArray) {
      const index = newLikes.indexOf(myUserInLikesArray);
      if (index !== -1) {
        newLikes.splice(index, 1);
        feedItem.likes = newLikes;
      }
    }
  }

  return oldFeedItems as InfiniteData<ListResponse<FeedItem>>;
}
