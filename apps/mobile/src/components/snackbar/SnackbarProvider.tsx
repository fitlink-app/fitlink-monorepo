import React, {useEffect, useState} from 'react';
import {SnackbarContext} from './SnackbarContext';
import {SnackbarQueryController} from './SnackbarQueryController';
import {useSnackbarController} from './useSnackbarController';

type Props = {
  children: React.ReactNode;
};

export const SnackbarProvider = ({children}: Props) => {
  const {showSnackbar, hideSnackbar} = useSnackbarController();
  const [snackbarController, setSnackbarController] =
    useState<SnackbarQueryController>();

  useEffect(() => {
    setSnackbarController(
      new SnackbarQueryController(showSnackbar, hideSnackbar),
    );
  }, [hideSnackbar, showSnackbar]);

  return (
    <SnackbarContext.Provider
      value={{
        enqueueSnackbar: snackbarController
          ? snackbarController.enqueue
          : () => {},
        showSnackbar: snackbarController ? snackbarController.show : () => {},
        removeSnackbar: snackbarController
          ? snackbarController.removeSnackbarFromQuery
          : () => {},
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
};
