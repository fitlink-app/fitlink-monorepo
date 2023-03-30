import {AxiosErrorEventHandler} from 'api/AxiosErrorEventHandler';
import {useContext, useEffect, useRef} from 'react';
import {SnackbarContext} from './SnackbarContext';
import {constantSnackbars} from './constants';
import {AxiosError} from 'axios';
import {isErrorHandledByDefault} from './isErrorHandledByDefault';
import {useNetInfo} from '@react-native-community/netinfo';
import {SnackbarQueryModel} from './types';

export const DefaultErrorSnackbarHandler = () => {
  const {showSnackbar, removeSnackbar} = useContext(SnackbarContext);
  useEffect(() => {
    return AxiosErrorEventHandler.addListener((error: AxiosError) => {
      if (isErrorHandledByDefault(error)) {
        showSnackbar({
          timeout: 6000,
          snackbar: constantSnackbars.DEFAULT_ERROR,
        });
      }
    });
  }, [showSnackbar]);

  const networkSnackbarRef = useRef<SnackbarQueryModel>();

  const netInfo = useNetInfo();
  useEffect(() => {
    if (netInfo.isConnected === false) {
      networkSnackbarRef.current = {
        snackbar: constantSnackbars.NETWORK_CONNECTION_ERROR,
      };
      showSnackbar({
        snackbar: constantSnackbars.NETWORK_CONNECTION_ERROR,
      });
    } else if (networkSnackbarRef.current) {
      removeSnackbar(networkSnackbarRef.current);
    }
  }, [showSnackbar, netInfo.isConnected, removeSnackbar]);
  return null;
};
