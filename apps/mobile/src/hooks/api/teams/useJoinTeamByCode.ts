import {useMutation} from 'react-query';
import api from '@api';

export function useJoinTeamByCode() {
  return useMutation((code: string) =>
    api.post<any>(`/teams/join`, {payload: {code}}),
  );
}
