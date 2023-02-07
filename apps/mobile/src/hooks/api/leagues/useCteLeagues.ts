import {useInfiniteQuery} from 'react-query';

import api from '@api';
import {QueryKeys} from '@query';
import {ListResponse} from '@fitlink/api-sdk/types';
import {LeagueWithDailyBfit} from '@fitlink/api/src/modules/leagues/entities/league.entity';

import {getNextPageParam} from 'utils/api';

const limit = 10;

type Params = {
  isParticipating?: boolean;
  pageParam?: number | undefined;
};

const fetchCteLeagues = ({pageParam = 0, isParticipating = false}: Params) =>
  api.list<LeagueWithDailyBfit>('/leagues/access/compete-to-earn', {
    page: pageParam,
    limit,
    isParticipating,
  });

export function useCteLeagues({
  isParticipating = false,
}: Pick<Params, 'isParticipating'> = {}) {
  return useInfiniteQuery<ListResponse<LeagueWithDailyBfit>, Error>(
    [QueryKeys.CteLeagues, isParticipating],
    ({pageParam}) => fetchCteLeagues({pageParam, isParticipating}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
