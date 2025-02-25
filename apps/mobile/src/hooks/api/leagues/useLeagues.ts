import {useInfiniteQuery} from 'react-query';
import {QueryKeys} from '@query';

import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {useMe} from '@hooks';

import {getNextPageParam} from 'utils/api';

const limit = 25;

const fetchLeagues = ({
  pageParam = 0,
  isPrivateOnly = false,
  isCte = false,
}: {
  pageParam?: number | undefined;
  isPrivateOnly?: boolean;
  isCte?: boolean;
}) =>
  api.list<LeaguePublic>('/leagues', {
    page: pageParam,
    limit,
    leagueFilter: isCte
      ? {
          isCte: true,
          isPublic: false,
          isOrganization: false,
          isPrivate: false,
          isTeam: false,
        }
      : {
          isPublic: !isPrivateOnly,
          isCte: false,
        },
  });

export function useLeagues() {
  const {data: user} = useMe({
    refetchOnMount: false,
  });
  const isPrivateOnly = Boolean(user?.teams.length);
  return useInfiniteQuery<ListResponse<LeaguePublic>, Error>(
    [QueryKeys.Leagues, isPrivateOnly, false],
    ({pageParam}) => fetchLeagues({pageParam, isPrivateOnly}),
    {
      getNextPageParam: getNextPageParam(limit),
    },
  );
}
