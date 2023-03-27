import {useCallback} from 'react';
import {SnackbarModel} from './types';
import Snackbar from 'react-native-snackbar';

export const useSnackbarController = () => {
  const showSnackbar = useCallback((snackbar: SnackbarModel) => {
    Snackbar.show({
      text: snackbar.text,
      action: snackbar.action
        ? {
            text: snackbar.action.text,
            onPress: snackbar.action.onPress,
            textColor: '#00E9D7',
          }
        : undefined,
      duration: Snackbar.LENGTH_INDEFINITE,
    });
  }, []);
  const hideSnackbar = useCallback(() => {
    Snackbar.dismiss();
  }, []);
  return {showSnackbar, hideSnackbar};
};
