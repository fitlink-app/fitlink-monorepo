import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {GoalsEntry} from '@fitlink/api/src/modules/goals-entries/entities/goals-entry.entity';

export function useUserGoals(userId: string) {
  //TODO: Finish hook when endpoint is complete
  //   return useQuery<GoalsEntry, Error>(QueryKeys.UserGoals, async () => {
  //     try {
  //       const response = await api.get<GoalsEntry>(`/user/${userId}/goals`);
  //       return response;
  //     } catch (err) {
  //       throw Error(err);
  //     }
  //   });
}
