import {useState} from 'react';
import {linkOauth} from '../utils';

const AUTH_ENDPOINT = 'providers/fitbit/auth';
const REVOKE_TOKEN_ENDPOINT = 'providers/fitbit/revokeToken';

export function useFitbit() {
  const [isLinking, setLinking] = useState(false);

  const link = async () => {
    setLinking(true);
    await linkOauth(AUTH_ENDPOINT);
    setLinking(false);
  };

  const unlink = async () => {
    setLinking(true);
    // TODO: To be implemented, API not working
    setLinking(false);
  };

  return {
    isLinking,
    link,
    unlink,
  };
}
