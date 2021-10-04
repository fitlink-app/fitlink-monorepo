import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useEffect, useState} from 'react';

// TODO: Typings
export function useProviders() {
  const [providerList, setProviderList] = useState<string[]>([]);

  const query = useQuery<any, Error>(
    QueryKeys.MyProviders,
    () => api.get<User>('/me/providers'),
    {
      onSuccess: data => {
        if (!data) return;
        setProviderListFromData(data);
      },
    },
  );

  useEffect(() => {
    if (!query.isFetchedAfterMount && query.data) {
      setProviderListFromData(query.data);
    }
  }, [query.data]);

  const setProviderListFromData = (data: any) => {
    setProviderList(data.map(provider => provider.type));
  };

  return {query, providerList};
}
