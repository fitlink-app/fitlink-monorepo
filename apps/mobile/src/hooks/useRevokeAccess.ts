import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/core';

import {useAppDispatch, useAppSelector} from '../redux/store';
import {
  revokeClientSideAccess,
  selectClientSideAccessGrantedAt,
} from '../redux/auth';

const IDLE_TIMEOUT_MIN = 1;
const MS_IN_MIN = 60 * 1000;

function wasIdle(accessGrantedAt: number) {
  return (Date.now() - accessGrantedAt) / MS_IN_MIN > IDLE_TIMEOUT_MIN;
}

export const useRevokeAccess = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const clientSideAccessGrantedAt = useAppSelector(
    selectClientSideAccessGrantedAt,
  );

  const revokeAccess = useCallback(() => {
    if (
      clientSideAccessGrantedAt !== undefined &&
      wasIdle(clientSideAccessGrantedAt)
    ) {
      dispatch(revokeClientSideAccess());
      navigation.reset({
        index: 0,
        routes: [{name: 'EnterPinCodeScreen'}],
      });
      return true;
    }
    return false;
  }, [dispatch, clientSideAccessGrantedAt, navigation]);

  return {revokeAccess};
};
