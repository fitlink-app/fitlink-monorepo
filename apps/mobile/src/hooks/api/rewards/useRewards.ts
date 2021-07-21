import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';

export const REWARD_RESULTS_PER_PAGE = 10;

const fetchRewards = ({pageParam = 0}: {pageParam?: number | undefined}) =>
  api.list<RewardPublic>(`/rewards`, {
    page: pageParam,
    limit: REWARD_RESULTS_PER_PAGE,
  });

// TODO: Implement params
export function useRewards(params: string[]) {
  return useInfiniteQuery<ListResponse<RewardPublic>, Error>(
    [QueryKeys.Rewards, params.toString()],
    ({pageParam}) => fetchRewards({pageParam}),
    {
      getNextPageParam: getNextPageParam(REWARD_RESULTS_PER_PAGE),
    },
  );
}
