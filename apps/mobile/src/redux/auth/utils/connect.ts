import api from '@api';
import {queryClient, QueryKeys} from '@query';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';

import {ConnectProvider} from '../types';

export async function connect({token, provider}: ConnectProvider) {
  const {me, auth} = await api.connect({
    token,
    provider,
    client_name: 'BFIT',
  });

  queryClient.setQueryData<User>(QueryKeys.Me, me);
  return auth;
}
