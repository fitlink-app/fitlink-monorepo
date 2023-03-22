import {useQuery, UseQueryOptions, QueryKey} from 'react-query';

import {fetchMe} from '@api';
import {QueryKeys} from '@query';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useMe(options?: UseQueryOptions<User, Error, User, QueryKey>) {
  return useQuery<User, Error>(QueryKeys.Me, fetchMe, {
    ...options,
  });
}
