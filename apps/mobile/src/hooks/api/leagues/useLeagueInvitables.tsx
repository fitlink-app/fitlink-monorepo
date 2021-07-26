import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';

export const RESULTS_PER_PAGE = 25;

const fetchInvitableUsers = ({
  pageParam = 0,
  leagueId,
}: {
  pageParam?: number | undefined;
  leagueId: string;
}) =>
  api.list<UserPublic>(`/leagues/${leagueId}/inviteable`, {
    page: pageParam,
    limit: RESULTS_PER_PAGE,
  });

export function useLeagueInvitables(leagueId: string) {
  return useInfiniteQuery<ListResponse<UserPublic>, Error>(
    [QueryKeys.LeagueInvitableUsers, leagueId],
    ({pageParam}) => fetchInvitableUsers({pageParam, leagueId}),
    {
      getNextPageParam: getNextPageParam(RESULTS_PER_PAGE),
      // refetchOnMount: true,
    },
  );
}
