import Axios, {AxiosError} from 'axios';
import {store} from 'redux/store';
import {Alert} from 'react-native';
import Config from 'react-native-config';

import {makeApi} from '@fitlink/api-sdk';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrorFields, getErrorMessage} from '@fitlink/api-sdk';

import {logout} from 'redux/auth';
import {RootState} from 'redux/reducer';
import {AxiosErrorEventHandler} from './AxiosErrorEventHandler';

const axios = Axios.create({
  baseURL: Config.API_URL,
});

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error: AxiosError) {
    console.log('axiosError', error);
    AxiosErrorEventHandler.$emit(error);
    return Promise.reject(error);
  },
);

export type RequestError = {
  message: string;
  fields?: {[field: string]: string};
};

export function getErrors(e: ResponseError) {
  return {
    message: getErrorMessage(e),
    fields: getErrorFields(e),
  } as RequestError;
}

/**
  Callback to gracefully log the user out when the refresh token is invalidated/revoked server side
 */
const handleRefreshTokenRefused = async () => {
  const authResult = (store.getState() as RootState).auth.authResult;

  if (authResult) {
    await store.dispatch(logout());
    Alert.alert('Session Expired', 'Your session has expired. Please login.');
  }
};

export default makeApi(axios, {
  onRefreshTokenFail: handleRefreshTokenRefused,
  clientId: 'BFIT',
});

export * from './fcmTokens';
