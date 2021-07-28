import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';

export function useDeleteLeague() {
  return useMutation((id: string) => api.delete(`/leagues/${id}`), {
    onSuccess: () => {
      // Invalidate Leagues
      queryClient.invalidateQueries(QueryKeys.Leagues);

      // Invalidate My Leagues
      queryClient.invalidateQueries(QueryKeys.MyLeagues);
    },
  });
}
