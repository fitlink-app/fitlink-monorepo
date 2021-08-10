import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';

export function useClaimReward() {
  return useMutation(
    (id: string) =>
      api.post<any>(`/rewards/${id}/redeem`, {payload: {rewardId: id}}),
    {
      onSuccess: (data, id) => {
        // Invalidate All Rewards
        queryClient.invalidateQueries(QueryKeys.Rewards);

        // Invalidate this reward
        queryClient.setQueryData<RewardPublic>(
          [QueryKeys.Reward, id],
          oldReward =>
            ({
              ...oldReward,
              redeemed: true,
            } as RewardPublic),
        );
        // Invalidate user
        queryClient.invalidateQueries(QueryKeys.User);
      },
    },
  );
}
