import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useMe(options?: UseQueryOptions<User, Error, User, QueryKey>) {
  return useQuery<User, Error>(
    QueryKeys.Me,
    () => api.get<User>('/me'),
    options,
  );
}