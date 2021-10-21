import api from '@api';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {useMutation} from 'react-query';
import {Linking} from 'react-native';
import Config from 'react-native-config';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {queryClient, QueryKeys} from '@query';
import {Provider} from '@fitlink/api/src/modules/providers/entities/provider.entity';

const API_URL = Config.API_URL;

export const linkOauth = async (endpoint: string) => {
  try {
    const response = await api.get<any>(endpoint);
    console.log(response.oauth_url);
    if ((await InAppBrowser.isAvailable()) && response.oauth_url) {
      const browserResponse = await InAppBrowser.openAuth(
        response.oauth_url,
        '/',
        {
          ephemeralWebSession: false,
        },
      );

      console.log('browser response');
      console.log(browserResponse);

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

export const unlinkProvider = (type: ProviderType) =>
  useMutation(() => api.delete(`me/providers/${type}`), {
    onSuccess: () => {
      // Invalidate providers
      queryClient.setQueriesData<Provider[]>(
        QueryKeys.MyProviders,
        oldActivities => oldActivities?.filter(x => x.type !== type) || [],
      );
    },
  });
