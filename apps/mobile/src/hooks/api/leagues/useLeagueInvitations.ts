import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {LeaguesInvitation} from '@fitlink/api/src/modules/leagues-invitations/entities/leagues-invitation.entity';

const limit = 25;

const fetchLeagueInvitations = ({
  pageParam = 0,
}: {
  pageParam?: number | undefined;
}) =>
  api.list<LeaguesInvitation>(`/me/league-invitations`, {
    page: pageParam,
    limit,
  });

export function useLeagueInvitations() {
  return useInfiniteQuery<ListResponse<LeaguesInvitation>, Error>(
    QueryKeys.LeagueInvitations,
    ({pageParam}) => fetchLeagueInvitations({pageParam}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
