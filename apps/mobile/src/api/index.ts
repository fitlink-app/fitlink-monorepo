import Axios from 'axios';
import {makeApi} from '@fitlink/api-sdk';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrorFields, getErrorMessage} from '@fitlink/api-sdk';
import Config from 'react-native-config';

const axios = Axios.create({
  baseURL: Config.API_URL,
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

axios.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});

// axios.interceptors.response.use(async response => {
//   console.warn('Remember to remove `sleep` from axios interceptors');
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   return response;
// });

export default makeApi(axios);

export * from './fcmTokens';
