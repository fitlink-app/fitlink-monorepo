import {useState} from 'react';
import {Linking} from 'react-native';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import Config from 'react-native-config';
import api, {getErrors} from '@api';
import {linkOauth} from '../utils';

const API_URL = Config.API_URL;
const AUTH_ENDPOINT = 'providers/strava/auth';
const REVOKE_TOKEN_ENDPOINT = 'providers/strava/revokeToken';
const AUTH_URL = API_URL + AUTH_ENDPOINT;

export function useStrava() {
  const [isLinking, setLinking] = useState(false);

  const link = async () => {
    setLinking(true);

    await linkOauth(API_URL);

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
