import {useMutation} from 'react-query';

import api from '@api';
import {queryClient, QueryKeys} from '@query';

import {OnWaitListResponse} from './useOnWaitList';

export function useJoinLeague() {
  // TODO: Fix in API SDK
  return useMutation((id: string) => api.post<any>(`/leagues/${id}/join`), {
    onSuccess: () => {
      queryClient.setQueryData<OnWaitListResponse>(
        QueryKeys.OnWaitlist,
        () => ({
          waitlist: true,
        }),
      );
    },
  });
}
