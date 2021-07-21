import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';

export function useReward(rewardId: string) {
  return useQuery<RewardPublic, Error>([QueryKeys.Reward, rewardId], () =>
    api.get<RewardPublic>(`/rewards/${rewardId}`),
  );
}
