import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import { useMe } from '@hooks';

export const REWARD_RESULTS_PER_PAGE = 10;

interface RewardsParams {
  locked?: boolean;
  expired?: boolean;
  available?: boolean;
}

const fetchRewards = ({
  pageParam = 0,
  params,
  isPrivateOnly = false,
}: {
  pageParam?: number | undefined;
  params: RewardsParams;
  isPrivateOnly?: boolean;
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
      isPrivateOnly,
    },
  );
};

export function useRewards(params: RewardsParams) {
  const {data: user} = useMe({
    refetchOnMount: false,
  });
  const isPrivateOnly = Boolean(user?.teams.length);
  return useInfiniteQuery<ListResponse<RewardPublic>, Error>(
    [QueryKeys.Rewards, JSON.stringify(params), isPrivateOnly],
    ({pageParam}) => fetchRewards({pageParam, params, isPrivateOnly}),
    {
      getNextPageParam: getNextPageParam(REWARD_RESULTS_PER_PAGE),
      keepPreviousData: true,
    },
  );
}
