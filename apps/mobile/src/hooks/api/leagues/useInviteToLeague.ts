import {useMutation, InfiniteData} from 'react-query';
import {ListResponse} from '@fitlink/api-sdk/types';
import api from '@api';
import {getResultsFromPages} from 'utils/api';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {LeaguesInvitation} from '@fitlink/api/src/modules/leagues-invitations/entities/leagues-invitation.entity';
import {queryClient, QueryKeys} from '@query';

export function useInviteToLeague() {
  return useMutation(
    ({leagueId, userId}: {leagueId: string; userId: string}) =>
      api.post<LeaguesInvitation>(`/leagues/${leagueId}/invitations`, {
        payload: {userId},
      }),
    {
      onMutate: async ({leagueId, userId}) => {
        await queryClient.cancelQueries([
          QueryKeys.LeagueInvitableUsers,
          leagueId,
        ]);

        const previousData = JSON.parse(
          JSON.stringify(
            queryClient.getQueryData([
              QueryKeys.LeagueInvitableUsers,
              leagueId,
            ]),
          ),
        );

        // Mutate invitables
        queryClient.setQueriesData<InfiniteData<ListResponse<UserPublic>>>(
          [QueryKeys.LeagueInvitableUsers, leagueId],
          oldInvitables => mutateUserIsInvitedToLeague(oldInvitables, userId),
        );

        return previousData;
      },
      onError: (err, {leagueId}, context) => {
        queryClient.setQueriesData(
          [QueryKeys.LeagueInvitableUsers, leagueId],
          context,
        );
      },
    },
  );
}

function mutateUserIsInvitedToLeague(
  oldUsers: InfiniteData<ListResponse<UserPublic>> | undefined,
  userId: string,
): InfiniteData<ListResponse<UserPublic>> {
  const users = getResultsFromPages<UserPublic>(oldUsers);
  const result = users?.find(user => user.id === userId);

  if (result) {
    result.invited = true;
  }

  return oldUsers as InfiniteData<ListResponse<UserPublic>>;
}
