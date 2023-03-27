import {SnackbarModel} from './types';

export const isSameSnackbar = (
  snackbarA: SnackbarModel,
  snackbarB: SnackbarModel,
) => {
  if (!snackbarA.type || !snackbarB.type) {
    return false;
  }
  return snackbarA.type === snackbarB.type;
};
