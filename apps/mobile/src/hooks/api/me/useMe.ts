import {useQuery, UseQueryOptions, QueryKey} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import Intercom from '@intercom/intercom-react-native';

export function useMe(options?: UseQueryOptions<User, Error, User, QueryKey>) {
  return useQuery<User, Error>(QueryKeys.Me, () => api.get<User>('/me'), {
    ...options,
    onSuccess: data => {
      if (!data) return;

      Intercom.updateUser({
        email: data.email,
        userId: data.id,
        name: data.name,
        signedUpAt: new Date(data.created_at).valueOf() / 1000,
        customAttributes: {
          rank: data.rank,
        },
      });
    },
  });
}
