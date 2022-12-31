import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {getNextPageParam} from 'utils/api';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useMe} from '@hooks';

const limit = 25;

const fetchLeagues = ({
  pageParam = 0,
  isPrivateOnly = false,
}: {
  pageParam?: number | undefined;
  isPrivateOnly: boolean;
}) =>
  api.list<League>('/leagues', {
    page: pageParam,
    limit,
    isPrivateOnly,
  });

export function useLeagues() {
  const {data: user} = useMe({
    refetchOnMount: false,
  });
  const isPrivateOnly = Boolean(user?.teams.length);
  return useInfiniteQuery<ListResponse<League>, Error>(
    QueryKeys.Leagues,
    ({pageParam}) => fetchLeagues({pageParam, isPrivateOnly}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
