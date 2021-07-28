import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {ListResponse} from '@fitlink/api-sdk/types';
import {Sport} from '@fitlink/api/src/modules/sports/entities/sport.entity';

export function useSports() {
  return useQuery<ListResponse<Sport>, Error>(QueryKeys.Sports, () =>
    api.get<ListResponse<Sport>>('/sports'),
  );
}
