import {useCallback} from 'react';

import {useAppStore} from '../redux/store';
import {selectClientSideAccessGrantedAt} from '../redux/auth';

const IDLE_TIMEOUT_MIN = 1;
const MS_IN_MIN = 60 * 1000;

export const useWasIdle = () => {
  const store = useAppStore();

  const wasIdle = useCallback(() => {
    const clientSideAccessGrantedAt = selectClientSideAccessGrantedAt(
      store.getState(),
    );

    const wasIdle =
      clientSideAccessGrantedAt !== undefined &&
      (Date.now() - clientSideAccessGrantedAt) / MS_IN_MIN > IDLE_TIMEOUT_MIN;

    return wasIdle;
  }, [store]);

  return {wasIdle};
};
