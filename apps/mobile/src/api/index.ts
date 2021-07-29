import Axios from 'axios';
import {makeApi} from '@fitlink/api-sdk';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrorFields, getErrorMessage} from '@fitlink/api-sdk';

const axios = Axios.create({
  baseURL: 'http://localhost:3000/api/v1',
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

// axios.interceptors.request.use(request => {
//   console.log('Request:', request);
//   return request;
// });

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});

axios.interceptors.request.use(
  config => new Promise(resolve => setTimeout(() => resolve(config), 600)),
);

export default makeApi(axios);
