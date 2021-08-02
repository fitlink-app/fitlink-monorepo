import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

export function useNextReward() {
  return useQuery<User, Error>(QueryKeys.NextReward, () =>
    api.get<User>('/me/next-reward'),
  );
}
