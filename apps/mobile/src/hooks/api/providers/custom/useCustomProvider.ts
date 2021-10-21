// import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {queryClient, QueryKeys} from '@query';
import {Provider} from '@fitlink/api/src/modules/providers/entities/provider.entity';
import {unlinkProvider} from '../utils';

export function useCustomProvider(type: ProviderType) {
  const linker = useMutation(
    () =>
      api.post<Provider>(`me/providers`, {
        payload: {type},
      }),
    {
      onSuccess: data => {
        queryClient.setQueriesData<Provider[]>(
          QueryKeys.MyProviders,
          oldActivities => [...(oldActivities || []), data],
        );
      },
    },
  );

  const unlinker = unlinkProvider(type);

  return {
    isLinking: linker.isLoading,
    isUnlinking: unlinker.isLoading,
    link: linker.mutateAsync,
    unlink: unlinker.mutateAsync,
  };
}
