import api from '@api';
import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth/authSlice';

export const LifeCycleEvents = () => {
  const appState = useRef(AppState.currentState);
  const isAuthenticated = useSelector(memoSelectIsAuthenticated);

  useEffect(() => {
    pingBackend();
  }, [isAuthenticated]);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Handle app coming into foreground
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Log activity on server
      pingBackend();
      // TODO: Sync local activities and goals
    }

    appState.current = nextAppState;
  };

  const pingBackend = () => {
    if (!isAuthenticated) return;
    api.put('/me/ping').catch(e => console.log('Failed to ping backend: ', e));
  };

  return null;
};
