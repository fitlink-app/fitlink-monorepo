import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import {REWARD_RESULTS_PER_PAGE} from './useRewards';

const fetchMyRewards = ({pageParam = 0}: {pageParam?: number | undefined}) => {
  return api.list<RewardPublic>(`/me/rewards`, {
    page: pageParam,
    limit: REWARD_RESULTS_PER_PAGE,
  });
};

export function useMyRewards() {
  return useInfiniteQuery<ListResponse<RewardPublic>, Error>(
    QueryKeys.MyRewards,
    ({pageParam}) => fetchMyRewards({pageParam}),
    {
      getNextPageParam: getNextPageParam(REWARD_RESULTS_PER_PAGE),
    },
  );
}
