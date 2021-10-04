import {useMutation} from 'react-query';
import api from '@api';
import {UpdateUserPasswordDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';

export function useUpdatePassword() {
  return useMutation((dto: UpdateUserPasswordDto) =>
    api.put<any>('/me/password', {payload: dto}),
  );
}
