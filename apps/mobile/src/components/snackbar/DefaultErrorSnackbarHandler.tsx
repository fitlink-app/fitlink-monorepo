import {AxiosErrorEventHandler} from 'api/AxiosErrorEventHandler';
import {useContext, useEffect, useRef} from 'react';
import {SnackbarContext} from './SnackbarContext';
import {constantSnackbars} from './constantSnackbars';
import {AxiosError} from 'axios';
import {isErrorHandledByDefault} from './isErrorHandledByDefault';
import {useNetInfo} from '@react-native-community/netinfo';

export const DefaultErrorSnackbarHandler = () => {
  const {showSnackbar} = useContext(SnackbarContext);
  useEffect(() => {
    return AxiosErrorEventHandler.addListener((error: AxiosError) => {
      if (isErrorHandledByDefault(error)) {
        showSnackbar({
          timeout: 3000,
          snackbar: constantSnackbars.DEFAULT_ERROR,
        });
      }
    });
  }, [showSnackbar]);

  const hideSnackbarRef = useRef<() => void>();

  const netInfo = useNetInfo();
  useEffect(() => {
    if (!netInfo.isConnected) {
      hideSnackbarRef.current = showSnackbar({
        snackbar: constantSnackbars.NETWORK_CONNECTION_ERROR,
      });
    } else {
      hideSnackbarRef.current?.();
    }
  }, [showSnackbar, netInfo.isConnected]);
  return null;
};
