import {queryClient, QueryKeys} from '@query';
import {useMutation, InfiniteData} from 'react-query';
import {ListResponse} from '../../../../../api-sdk/types';
import api from '@api';
import {getResultsFromPages} from 'utils/api';
import {UserPublic} from '../../../../../api/src/modules/users/entities/user.entity';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useUnfollowUser() {
  return useMutation((id: string) => api.delete(`/me/following/${id}`), {
    onMutate: async userId => {
      // TODO: Mutate user itself

      // Mutate Followers
      queryClient.setQueryData<InfiniteData<ListResponse<UserPublic>>>(
        QueryKeys.Followers,
        oldFollowers => mutateUserOnUnfollow(oldFollowers, userId),
      );

      // Mutate User Search
      queryClient.setQueriesData<InfiniteData<ListResponse<UserPublic>>>(
        QueryKeys.SearchUsers,
        oldFollowers => mutateUserOnUnfollow(oldFollowers, userId),
      );

      // Mutate Following
      queryClient.setQueriesData<InfiniteData<ListResponse<UserPublic>>>(
        QueryKeys.Following,
        oldFollowers => {
          oldFollowers?.pages.forEach(page => {
            page.results.forEach(result => {
              if (result.id === userId) {
                const index = page.results.indexOf(result);
                page.results.splice(index, 1);
              }
            });
          });

          return oldFollowers as InfiniteData<ListResponse<UserPublic>>;
        },
      );

      // Mutate User Details
      queryClient.setQueryData<UserPublic>(
        [QueryKeys.User, userId],
        oldUser => ({...oldUser!, following: false}),
      );

      // Mutate Me
      queryClient.setQueryData<User>(QueryKeys.Me, oldUser => ({
        ...oldUser!,
        following_total: oldUser!.following_total - 1,
      }));
    },
  });
}

function mutateUserOnUnfollow(
  oldUsers: InfiniteData<ListResponse<UserPublic>> | undefined,
  userId: string,
): InfiniteData<ListResponse<UserPublic>> {
  const users = getResultsFromPages<UserPublic>(oldUsers);
  const result = users?.find(user => user.id === userId);

  if (result) {
    result.following = false;
  }

  return oldUsers as InfiniteData<ListResponse<UserPublic>>;
}
