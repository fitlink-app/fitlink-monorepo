import api from '@api';
import {Linking} from 'react-native';
import Config from 'react-native-config';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const API_URL = Config.API_URL;

export const linkOauth = async (endpoint: string) => {
  try {
    const response = await api.get<any>(endpoint);

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
    } else Linking.openURL(API_URL + endpoint);
  } catch (e) {
    console.log(e);
  }
};
