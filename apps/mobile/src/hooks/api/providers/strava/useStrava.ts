import {useState} from 'react';
import {Linking} from 'react-native';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import Config from 'react-native-config';
import api from '@api';

const API_URL = Config.API_URL;
const AUTH_ENDPOINT = 'providers/strava/auth';
const AUTH_URL = API_URL + AUTH_ENDPOINT;

export function useStrava() {
  const [isLinking, setLinking] = useState(false);

  const link = async () => {
    setLinking(true);

    try {
      const response = await api.get<any>('/' + AUTH_ENDPOINT);

      if ((await InAppBrowser.isAvailable()) && response.oauth_url) {
        const decodedUrl = decodeURIComponent(response.oauth_url)
          .replace(/\n/g, ' ')
          .replace(/\s+/g, '');

        const browserResponse = await InAppBrowser.openAuth(decodedUrl, '/', {
          ephemeralWebSession: false,
        });

        if (browserResponse.type === 'success' && browserResponse.url) {
          if (!browserResponse.url.includes('auth-success')) {
            throw Error('Something went wrong.');
          }
        }
      } else Linking.openURL(AUTH_URL);
    } catch (e) {
      console.log(e);
    }

    setLinking(false);
  };

  const unlink = async () => {
    // unlink
  };

  return {
    isLinking,
    link,
    unlink,
  };
}
