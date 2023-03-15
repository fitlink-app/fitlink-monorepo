import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {
  revokeClientSideAccess,
  selectLastClientSideAccessGranted,
} from '../redux/auth';
import {useAppDispatch, useAppSelector} from '../redux/store';
import {navigationRef} from '@routes';

const IDLE_TIMEOUT_MIN = 1;
const MS_IN_MIN = 60 * 1000;

function wasIdle(lastAccessGranted: number) {
  return (Date.now() - lastAccessGranted) / MS_IN_MIN > IDLE_TIMEOUT_MIN;
}

export const useRevokeIdleAccess = () => {
  const dispatch = useAppDispatch();
  const lastClientSideAccessGranted = useAppSelector(
    selectLastClientSideAccessGranted,
  );

  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (
          lastClientSideAccessGranted !== undefined &&
          wasIdle(lastClientSideAccessGranted)
        ) {
          dispatch(revokeClientSideAccess());
          navigationRef.current?.navigate('EnterPinCodeScreen');
        }
      }

      appStateRef.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);
};
