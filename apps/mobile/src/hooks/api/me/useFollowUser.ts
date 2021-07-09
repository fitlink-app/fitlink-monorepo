import {queryClient, QueryKeys} from '@query';
import {useMutation, InfiniteData} from 'react-query';
import {ListResponse} from '../../../../../api-sdk/types';
import api from '@api';
import {getResultsFromPages} from 'utils/api';
import {UserPublic} from '../../../../../api/src/modules/users/entities/user.entity';

export function useFollowUser() {
  return useMutation(
    (id: string) => api.post<any>(`/me/following`, {targetId: id}),
    {
      onMutate: async userId => {
        // TODO: Mutate user itself

        // Mutate Followers
        queryClient.setQueryData<InfiniteData<ListResponse<UserPublic>>>(
          QueryKeys.Followers,
          oldFollowers => mutateUserOnFollow(oldFollowers, userId),
        );

        // Mutate User Search
        queryClient.setQueriesData<InfiniteData<ListResponse<UserPublic>>>(
          QueryKeys.SearchUsers,
          oldFollowers => mutateUserOnFollow(oldFollowers, userId),
        );
      },

      onSuccess: () => {
        // Invalidate Following
        queryClient.invalidateQueries(QueryKeys.Following);
      },
    },
  );
}

function mutateUserOnFollow(
  oldUsers: InfiniteData<ListResponse<UserPublic>> | undefined,
  userId: string,
): InfiniteData<ListResponse<UserPublic>> {
  const users = getResultsFromPages<UserPublic>(oldUsers);
  const result = users?.find(user => user.id === userId);

  if (result) {
    result.following = true;
  }

  return oldUsers as InfiniteData<ListResponse<UserPublic>>;
}
