import {useMutation} from 'react-query';
import api from '@api';

export function useRequestPasswordReset() {
  return useMutation((email: string) =>
    api.post<any>(`/auth/request-password-reset`, {payload: {email}}),
  );
}
