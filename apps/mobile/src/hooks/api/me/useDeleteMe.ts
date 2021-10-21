import {useMutation} from 'react-query';
import api from '@api';

export function useDeleteMe() {
  return useMutation(() => api.delete(`/me`));
}
