import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import api from '@api';
import {useEffect, useState} from 'react';
import {Provider} from '@fitlink/api/src/modules/providers/entities/provider.entity';

// TODO: Typings
export function useProviders() {
  const [providerList, setProviderList] = useState<string[]>([]);

  const query = useQuery<any, Error>(
    QueryKeys.MyProviders,
    () => api.get<Provider[]>('/me/providers'),
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

  const setProviderListFromData = (data: Provider[]) => {
    setProviderList(data.map(provider => provider.type));
  };

  return {query, providerList};
}
