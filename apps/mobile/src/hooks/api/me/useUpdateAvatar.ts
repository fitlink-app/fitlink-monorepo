import {useMutation} from 'react-query';
import {queryClient, QueryKeys} from '@query';
import api from '@api';
import {UpdateUserAvatarDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';

export function useUpdateAvatar() {
  return useMutation(
    (dto: UpdateUserAvatarDto) => api.put<any>('/me/avatar', {payload: dto}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKeys.Me);
      },
    },
  );
}
