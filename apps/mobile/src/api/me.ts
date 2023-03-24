import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {queryClient, QueryKeys} from '@query';

import api from './index';

export function fetchMe() {
  return api.get<User>('/me');
}

export async function prefetchMe() {
  await queryClient.prefetchQuery(QueryKeys.Me, fetchMe);
  return queryClient.getQueryData<User>(QueryKeys.Me);
}
