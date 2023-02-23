import {useState} from 'react';

import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';

import {linkOauth, unlinkProvider} from '../utils';

export function useStrava() {
  const [isLinking, setLinking] = useState(false);

  const link = async () => {
    try {
      setLinking(true);
      await linkOauth(ProviderType.Strava);
    } catch (e) {
      console.error('link Strava', e);
      throw e;
    } finally {
      setLinking(false);
    }
  };

  const unlinker = unlinkProvider(ProviderType.Strava);

  return {
    isLinking,
    link,
    isUnlinking: unlinker.isLoading,
    unlink: unlinker.mutateAsync,
  };
}
