import {AxiosError} from 'axios';

export const isErrorHandledByDefault = (error: AxiosError) => {
  // add conditios for default error handler here
  return error.response?.status === 500;
};
