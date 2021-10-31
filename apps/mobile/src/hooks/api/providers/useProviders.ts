import {useQuery} from 'react-query';
import {QueryKeys} from '@query';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {fetchProviderList} from 'services/common';

export function useProviders() {
  return useQuery<ProviderType[], Error>(
    QueryKeys.MyProviders,
    () => fetchProviderList(),
    {
      initialData: [],
    },
  );
}
