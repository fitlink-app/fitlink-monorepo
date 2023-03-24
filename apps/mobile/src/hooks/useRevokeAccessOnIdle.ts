import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {useRevokeAccess} from './useRevokeAccess';

export const useRevokeAccessOnIdle = () => {
  const appStateRef = useRef(AppState.currentState);

  const {revokeAccess} = useRevokeAccess();

  useEffect(() => {
    revokeAccess();
  }, [revokeAccess]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        revokeAccess();
      }

      appStateRef.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [revokeAccess]);
};
