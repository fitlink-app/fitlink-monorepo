import api from '@api';
import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth/authSlice';
import {AppleHealthKitWrapper, GoogleFitWrapper} from 'services';

export const LifeCycleEvents = () => {
  const appState = useRef(AppState.currentState);
  const isAuthenticated = useSelector(memoSelectIsAuthenticated);

  useEffect(() => {
    runBackgroundSyncTasks();

    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    pingBackend();
  }, [isAuthenticated]);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Handle app coming into foreground
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Log activity on server
      pingBackend();
      syncHealthData();
    }

    appState.current = nextAppState;
  };

  const pingBackend = () => {
    if (!isAuthenticated) return;
    api.put('/me/ping').catch(e => console.log('Failed to ping backend: ', e));
  };

  const runBackgroundSyncTasks = () => {
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15,
        // Android options
        forceAlarmManager: false,
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NOT_ROAMING,
        enableHeadless: true,
      },
      async taskId => {
        console.log('[js] Received background-fetch event: ', taskId);

        await syncHealthData();

        BackgroundFetch.finish(taskId);
      },
      e => {
        console.log('[js] RNBackgroundFetch failed to start');
      },
    );
  };

  const syncHealthData = async () => {
    if (!isAuthenticated) return;

    if (Platform.OS === 'android') {
      await GoogleFitWrapper.syncAllWithBackend();
    } else if (Platform.OS === 'ios') {
      await AppleHealthKitWrapper.syncAllWithBackend();
    }
  };

  return null;
};
