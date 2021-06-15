import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useMe() {
  return useQuery<User, Error>(QueryKeys.Me, async () => {
    try {
      const response = await api.get<User>('/me');
      return response;
    } catch (err) {
      throw Error(err);
    }
  });
}
