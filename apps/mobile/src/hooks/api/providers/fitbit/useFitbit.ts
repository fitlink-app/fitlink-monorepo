import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {useState} from 'react';
import {linkOauth, unlinkProvider} from '../utils';

const AUTH_ENDPOINT = 'providers/fitbit/auth';
const REVOKE_TOKEN_ENDPOINT = 'providers/fitbit/revokeToken';

export function useFitbit() {
  const [isLinking, setLinking] = useState(false);

  const link = async () => {
    setLinking(true);
    await linkOauth(AUTH_ENDPOINT);
    setLinking(false);
  };

  const unlinker = unlinkProvider(ProviderType.Fitbit);

  return {
    isLinking,
    link,
    isUnlinking: unlinker.isLoading,
    unlink: unlinker.mutateAsync,
  };
}
