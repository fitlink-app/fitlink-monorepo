import {useMutation} from 'react-query';
import api from '@api';

import {queryClient, QueryKeys} from '@query';

import {Reward} from '@fitlink/api/src/modules/rewards/entities/reward.entity';

export function useClaimReward() {
  return useMutation(
    (id: string) =>
      api.post<Reward>(`/rewards/${id}/redeem`, {payload: {rewardId: id}}),
    {
      onSuccess: (data: Reward, id) => {
        queryClient.invalidateQueries(QueryKeys.Rewards);
        queryClient.invalidateQueries([QueryKeys.Reward, id]);
        queryClient.invalidateQueries(QueryKeys.Me);
        queryClient.invalidateQueries(QueryKeys.NextReward);
      },
    },
  );
}
