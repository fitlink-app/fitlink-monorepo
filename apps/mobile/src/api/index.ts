import Axios from 'axios';
import {makeApi} from '@fitlink/api-sdk';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrorFields, getErrorMessage} from '@fitlink/api-sdk';
import Config from 'react-native-config';
import {Alert} from 'react-native';
import {store} from 'redux/store';
import {RootState} from 'redux/reducer';
import {logout} from 'redux/auth';

const axios = Axios.create({
  baseURL: 'https://api-prod.fitlinkapp.com/api/v1/', // Config.API_URL,
});

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

export default makeApi(axios, {onRefreshTokenFail: handleRefreshTokenRefused});

export * from './fcmTokens';
