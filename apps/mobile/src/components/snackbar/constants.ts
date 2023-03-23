import {SnackbarType} from './types';

export const constantSnackbars = {
  DEFAULT_ERROR: {
    type: SnackbarType.DEFAULT_ERROR,
    text: 'Something went wrong, please try again later',
  },
  NETWORK_CONNECTION_ERROR: {
    type: SnackbarType.NETWORK_ERROR,
    text: 'No network',
  },
};

export const DEFAULT_SNACKBAR_TIMEOUT = 4000;
