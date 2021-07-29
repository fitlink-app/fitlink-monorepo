import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';

export function useInviteToLeague() {
  return useMutation(({leagueId, userId}: {leagueId: string; userId: string}) =>
    api.post<any>(`/leagues/${leagueId}/invitations`, {userId}),
  );
}
