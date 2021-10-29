import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useUser({
  userId,
  options,
}: {
  userId: string;
  options?: UseQueryOptions<User, Error, User, QueryKey>;
}) {
  return useQuery<User, Error>(
    [QueryKeys.User, userId],
    () => api.get<User>(`/users/${userId}`),
    options,
  );
}
