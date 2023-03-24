import {useCallback} from 'react';

import {AuthPromiseProvider} from '@model';

import {useAppDispatch} from '../redux/store';
import {revokeClientSideAccess} from '../redux/auth';
import {useWasIdle} from './useWasIdle';

export const useRevokeAccess = () => {
  const dispatch = useAppDispatch();

  const {wasIdle} = useWasIdle();

  const revokeAccess = useCallback(() => {
    if (wasIdle()) {
      dispatch(revokeClientSideAccess());
      AuthPromiseProvider.getInstance().init();
      return true;
    }
    return false;
  }, [dispatch, wasIdle]);

  return {revokeAccess};
};
