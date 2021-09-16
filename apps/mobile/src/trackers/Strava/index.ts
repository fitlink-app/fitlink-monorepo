import api from '@api';
import {Linking} from 'react-native';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';

const API_URL = 'https://www.google.com';
const AUTH_ENDPOINT = '/providers/strava/auth/';
const AUTH_URL = API_URL + AUTH_ENDPOINT;

async function link() {
  //   const response = await request(AUTH_ENDPOINT, {
  //     method: "GET",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //   });

  const response = api.get('/something');

  if ((await InAppBrowser.isAvailable()) && response.data?.redirect_url) {
    const browserResponse = await InAppBrowser.openAuth(
      response.data.redirect_url,
      '/',
      {
        ephemeralWebSession: false,
      },
    );

    if (browserResponse.type === 'success' && browserResponse.url) {
      if (!browserResponse.url.includes('auth-success')) {
        throw Error('Something went wrong.');
      }
    }
  } else Linking.openURL(AUTH_URL);
}

async function unlink() {
  await request(`/providers/strava/deauth/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

export const StravaWrapper = {link, unlink};
