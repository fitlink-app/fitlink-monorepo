import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/core';

import {useAppDispatch} from '../redux/store';
import {revokeClientSideAccess} from '../redux/auth';
import {useWasIdle} from './useWasIdle';

export const useRevokeAccess = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {wasIdle} = useWasIdle();

  const revokeAccess = useCallback(() => {
    if (wasIdle()) {
      dispatch(revokeClientSideAccess());
      navigation.reset({
        index: 0,
        routes: [{name: 'EnterPinCodeScreen', params: {forceBiometry: true}}],
      });
      return true;
    }
    return false;
  }, [dispatch, navigation, wasIdle]);

  return {revokeAccess, wasIdle};
};
