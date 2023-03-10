// import {queryClient, QueryKeys} from '@query';
import {useMutation} from 'react-query';
import api from '@api';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {queryClient, QueryKeys} from '@query';
import {Provider} from '@fitlink/api/src/modules/providers/entities/provider.entity';
import {unlinkProvider} from '../utils';
import {syncAllPlatformActivities} from 'services/common';

export function useCustomProvider(type: ProviderType) {
  const linker = useMutation(
    async (authMethod?: () => Promise<any>) => {
      // Method to be ran before saving the link on backend (e.g. authenticating against Apple Healthkit)
      if (!!authMethod) await authMethod();

      return api.post<Provider>(`me/providers`, {
        payload: {
          type,
          // TODO(mobile): @KirillRodichev need to update this with the actual device id
          deviceid: 'mobile',
        },
      });
    },
    {
      onSuccess: data => {
        queryClient.setQueriesData<ProviderType[]>(
          QueryKeys.MyProviders,
          oldProviders => [...(oldProviders || []), data.type as ProviderType],
        );

        // Sync
        syncAllPlatformActivities();
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
