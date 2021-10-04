import {useMutation} from 'react-query';
import {queryClient, QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {UpdateUserEmailDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';

export function useUpdateEmail() {
  return useMutation(
    (dto: UpdateUserEmailDto) => api.put<any>('/me/email', {payload: dto}),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData<User>(
          QueryKeys.Me,
          oldUser => ({...oldUser, email: variables.email} as User),
        );
      },
    },
  );
}
