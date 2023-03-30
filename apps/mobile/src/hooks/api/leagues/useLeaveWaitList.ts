import {useMutation} from 'react-query';

import api from '@api';
import {queryClient, QueryKeys} from '@query';

import {OnWaitListResponse} from './useOnWaitList';

export function useLeaveWaitList() {
  return useMutation(
    (id: string) => api.post<any>(`/leagues/${id}/waitlists/leave`),
    {
      onSuccess: () => {
        queryClient.setQueryData<OnWaitListResponse>(
          QueryKeys.OnWaitlist,
          () => ({
            waitlist: false,
          }),
        );
      },
    },
  );
}
