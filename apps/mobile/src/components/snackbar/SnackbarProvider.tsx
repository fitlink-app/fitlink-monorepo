import React, {useCallback, useEffect, useRef} from 'react';
import {useSnackbarQuery} from './useSnackbarQuery';
import {SnackbarQueryModel} from './types';
import {SnackbarContext} from './SnackbarContext';
import {useSnackbarController} from './useSnackbarController';
import {isSameSnackbar} from './utils';

type Props = {
  children: React.ReactNode;
};

export const SnackbarProvider = ({children}: Props) => {
  const {currentModel, pushModel, removeModel, unshiftModel} =
    useSnackbarQuery();

  const {showSnackbar, hideSnackbar} = useSnackbarController();

  const timer = useRef<NodeJS.Timeout>();

  const removeModelCallback = useCallback(
    (model: SnackbarQueryModel) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      hideSnackbar();
      removeModel(model);
    },
    [hideSnackbar, removeModel],
  );

  useEffect(() => {
    if (currentModel) {
      showSnackbar(currentModel.snackbar);
      if (currentModel.timeout) {
        timer.current = setTimeout(() => {
          removeModelCallback(currentModel);
        }, currentModel.timeout);
      }
    }
  }, [currentModel, removeModelCallback, showSnackbar]);

  const showSnackbarCallback = useCallback(
    (model: SnackbarQueryModel, withDuplicate: boolean = false) => {
      if (withDuplicate) {
        unshiftModel(model);
        return () => {
          removeModelCallback(model);
        };
      }
      if (
        currentModel &&
        isSameSnackbar(model.snackbar, currentModel.snackbar)
      ) {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        if (model.timeout) {
          timer.current = setTimeout(() => {
            removeModelCallback(currentModel);
          }, model.timeout);
        }
        return () => {
          removeModelCallback(currentModel);
        };
      } else {
        unshiftModel(model);
      }
      return () => {
        removeModelCallback(model);
      };
    },
    [currentModel, removeModelCallback, unshiftModel],
  );

  const enqueueSnackbarCallback = useCallback(
    (model: SnackbarQueryModel, withDuplicate?: boolean) => {
      if (model.snackbar.action !== undefined) {
        pushModel(
          {
            ...model,
            snackbar: {
              ...model.snackbar,
              action: {
                ...model.snackbar.action,
                onPress: () => {
                  model.snackbar.action?.onPress?.();
                  removeModelCallback(model);
                },
              },
            },
          },
          withDuplicate,
        );
      }
      pushModel(model, withDuplicate);
      return () => {
        removeModelCallback(model);
      };
    },
    [pushModel, removeModelCallback],
  );

  return (
    <SnackbarContext.Provider
      value={{
        enqueueSnackbar: enqueueSnackbarCallback,
        showSnackbar: showSnackbarCallback,
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
};
