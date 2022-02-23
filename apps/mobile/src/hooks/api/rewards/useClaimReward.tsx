import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {
  Reward,
  RewardPublic,
} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useClaimReward() {
  return useMutation(
    (id: string) =>
      api.post<Reward>(`/rewards/${id}/redeem`, {payload: {rewardId: id}}),
    {
      onSuccess: (data: Reward, id) => {
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

        queryClient.setQueryData<User>(QueryKeys.Me, oldUser => {
          return {
            ...oldUser,
            points_total: oldUser!.points_total - data.points_required,
          } as User;
        });

        queryClient.invalidateQueries(QueryKeys.NextReward);
      },
    },
  );
}
