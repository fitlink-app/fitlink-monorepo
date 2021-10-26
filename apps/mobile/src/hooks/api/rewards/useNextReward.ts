import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {RewardNext} from '@fitlink/api/src/modules/rewards/entities/reward.entity';

export function useNextReward(
  options?: UseQueryOptions<RewardNext, Error, RewardNext, QueryKey>,
) {
  return useQuery<RewardNext, Error>(
    QueryKeys.NextReward,
    () => api.get<RewardNext>('/me/next-reward'),
    {
      ...options,
    },
  );
}
