import {useCallback, useState} from 'react';
import {SnackbarQueryModel} from './types';

export const useSnackbarQuery = () => {
  const [models, setModels] = useState<SnackbarQueryModel[]>([]);

  const pushModel = useCallback(
    (model: SnackbarQueryModel, withDuplicate: boolean = false) => {
      if (
        !withDuplicate &&
        model.snackbar.type === models[models.length - 1].snackbar.type
      ) {
        return;
      }
      setModels(state => [...state, model]);
    },
    [models],
  );

  const unshiftModel = useCallback((model: SnackbarQueryModel) => {
    setModels(state => [model, ...state]);
  }, []);

  const removeModel = useCallback((model: SnackbarQueryModel) => {
    setModels(state => state.filter(stateModel => stateModel !== model));
  }, []);

  const currentModel = models.length ? models[0] : undefined;

  return {
    pushModel,
    removeModel,
    unshiftModel,
    currentModel,
    models,
  };
};
