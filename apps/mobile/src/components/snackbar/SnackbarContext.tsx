import React from 'react';
import {SnackbarQueryModel} from './types';

export const SnackbarContext = React.createContext<SnackbarContextValues>({
  enqueueSnackbar: () => {},
  showSnackbar: () => {},
  removeSnackbar: () => {},
});

type SnackbarContextValues = {
  enqueueSnackbar: (model: SnackbarQueryModel) => void;
  showSnackbar: (model: SnackbarQueryModel) => void;
  removeSnackbar: (model: SnackbarQueryModel) => void;
};
