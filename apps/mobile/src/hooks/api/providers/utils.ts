import {useMutation} from 'react-query';
import {Linking} from 'react-native';
import Config from 'react-native-config';
import InAppBrowser from 'react-native-inappbrowser-reborn';

import api from '@api';
import {queryClient, QueryKeys} from '@query';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {Provider} from '@fitlink/api/src/modules/providers/entities/provider.entity';

const API_URL = Config.API_URL;

enum AuthEndpointsEnum {
  Strava = 'providers/strava/auth',
  Fitbit = 'providers/fitbit/auth',
}

function mapProviderToAuthEndpoint(providerType: ProviderType) {
  switch (providerType) {
    case ProviderType.Strava:
      return AuthEndpointsEnum.Strava;
    case ProviderType.Fitbit:
      return AuthEndpointsEnum.Fitbit;
    default:
      return null;
  }
}

export const linkOauth = async (providerType: ProviderType) => {
  const errorTag = `${providerType} linkAuth`;
  const endpoint = mapProviderToAuthEndpoint(providerType);

  if (!endpoint) {
    console.error(`OAuth linking is not supported for ${providerType}`);
    return;
  }

  try {
    const response = await api.get<{oauth_url: string}>(endpoint);

    if ((await InAppBrowser.isAvailable()) && response.oauth_url) {
      const browserResponse = await InAppBrowser.openAuth(
        response.oauth_url,
        'fitlink-app://',
        {
          ephemeralWebSession: false,
          forceCloseOnRedirection: false,
          showInRecents: true,
        },
      );

      if (browserResponse.type === 'success' && browserResponse.url) {
        if (!browserResponse.url.includes('auth-success')) {
          throw Error('Something went wrong.');
        }

        // Mutate query
        const data = {
          type: providerType,
        };

        queryClient.setQueriesData<Provider[]>(
          QueryKeys.MyProviders,
          oldActivities => [...(oldActivities || []), data as Provider],
        );
      } else {
        // even when auth is cancelled, the providers can be updated with a new one
        await queryClient.invalidateQueries(QueryKeys.MyProviders);
        console.warn(errorTag, browserResponse.type);
      }
    } else {
      Linking.openURL(API_URL + endpoint);
    }
  } catch (e) {
    console.error(errorTag, e);
  }
};

export const unlinkProvider = (type: ProviderType) =>
  useMutation(() => api.delete(`me/providers/${type}`), {
    onSuccess: () => {
      // Invalidate providers
      queryClient.setQueriesData<ProviderType[]>(
        QueryKeys.MyProviders,
        oldActivities => oldActivities?.filter(x => x !== type) || [],
      );
    },
  });
