import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {useState} from 'react';
import {linkOauth, unlinkProvider} from '../utils';

const AUTH_ENDPOINT = 'providers/strava/auth';
const REVOKE_TOKEN_ENDPOINT = 'providers/strava/revokeToken';

export function useStrava() {
  const [isLinking, setLinking] = useState(false);

  const link = async () => {
    setLinking(true);
    await linkOauth(AUTH_ENDPOINT, ProviderType.Strava);
    setLinking(false);
  };

  const unlinker = unlinkProvider(ProviderType.Strava);

  return {
    isLinking,
    link,
    isUnlinking: unlinker.isLoading,
    unlink: unlinker.mutateAsync,
  };
}
