import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {GoalsEntry} from '@fitlink/api/src/modules/goals-entries/entities/goals-entry.entity';

export function useUserGoals(userId: string) {
  return useQuery<GoalsEntry, Error>([QueryKeys.UserGoals, userId], async () =>
    api.get<GoalsEntry>(`/users/${userId}/goals`),
  );
}
