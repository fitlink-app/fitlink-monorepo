import {useCallback, useContext} from 'react';
import {SnackbarContext} from './SnackbarContext';
import {DEFAULT_SNACKBAR_TIMEOUT} from './constants';

export const useDefaultOkSnackbar = () => {
  const {enqueueSnackbar} = useContext(SnackbarContext);
  return useCallback(
    (
      text: string,
      withTimeout = true,
      actionText = 'OK',
      onPress?: () => void,
    ) => {
      enqueueSnackbar({
        snackbar: {
          text,
          action: {
            text: actionText,
            onPress,
          },
        },
        timeout: withTimeout ? DEFAULT_SNACKBAR_TIMEOUT : undefined,
      });
    },
    [enqueueSnackbar],
  );
};
