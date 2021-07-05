import {useMutation} from 'react-query';
import api from '@api';

export function useJoinLeague() {
  // TODO: Fix in API SDK
  return useMutation((id: string) => api.post<any>(`/leagues/${id}/join`), {
    onSuccess: (data, variables) => {
      console.log('mutate here');
      console.log(data);
      console.log(variables);
    },
  });
}
