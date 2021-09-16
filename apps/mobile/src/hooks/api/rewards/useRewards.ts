import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';

export const REWARD_RESULTS_PER_PAGE = 10;

interface RewardsParams {
  locked?: boolean;
  expired?: boolean;
  available?: boolean;
}

const fetchRewards = ({
  pageParam = 0,
  params,
}: {
  pageParam?: number | undefined;
  params: RewardsParams;
}) => {
  const searchParams = new URLSearchParams();

  if (params.locked) {
    searchParams.append('locked', String(!!params.locked));
  }

  if (params.expired) {
    searchParams.append('expired', String(!!params.expired));
  }

  if (params.available) {
    searchParams.append('available', String(!!params.available));
  }

  return api.list<RewardPublic>(
    `/rewards${Array.from(searchParams).length ? `?${searchParams}` : ''}`,
    {
      page: pageParam,
      limit: REWARD_RESULTS_PER_PAGE,
    },
  );
};

export function useRewards(params: RewardsParams) {
  return useInfiniteQuery<ListResponse<RewardPublic>, Error>(
    [QueryKeys.Rewards, JSON.stringify(params)],
    ({pageParam}) => fetchRewards({pageParam, params}),
    {
      getNextPageParam: getNextPageParam(REWARD_RESULTS_PER_PAGE),
      keepPreviousData: true,
    },
  );
}
