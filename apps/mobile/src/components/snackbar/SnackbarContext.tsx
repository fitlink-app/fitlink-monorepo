import React from 'react';
import {SnackbarQueryModel} from './types';

export const SnackbarContext = React.createContext<SnackbarContextValues>({
  enqueueSnackbar: () => () => {},
  showSnackbar: () => () => {},
});

type SnackbarContextValues = {
  enqueueSnackbar: (model: SnackbarQueryModel) => () => void;
  showSnackbar: (model: SnackbarQueryModel) => () => void;
};
