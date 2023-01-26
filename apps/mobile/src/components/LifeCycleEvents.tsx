import api from '@api';
import {UpdateUserDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth';
import * as RNLocalize from 'react-native-localize';
import {syncAllPlatformActivities} from 'services/common';

export const LifeCycleEvents = () => {
  const appState = useRef(AppState.currentState);
  const isAuthenticated = useSelector(memoSelectIsAuthenticated);

  useEffect(() => {
    runBackgroundSyncTasks();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      pingBackend();
      storeDeviceInfo();
      syncAllPlatformActivities();
    }

    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, [isAuthenticated]);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Handle app coming into foreground
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Log activity on server
      if (isAuthenticated) {
        updateTimezone();
        pingBackend();
        syncAllPlatformActivities();
      }
    }

    appState.current = nextAppState;
  };

  const pingBackend = () => {
    if (!isAuthenticated) return;
    api.put('/me/ping').catch(e => console.log('Failed to ping backend: ', e));
  };

  const updateTimezone = () => {
    const timezone = RNLocalize.getTimeZone();
    console.log(timezone);

    const userSettingPayload: UpdateUserDto = {
      timezone,
    };

    api
      .put<User>('/me', {payload: userSettingPayload})
      .catch(e => console.log('Failed to update user timezone', e));
  };

  const storeDeviceInfo = () => {
    const updatedSettings: UpdateUserDto = {
      mobile_os: Platform.OS === 'ios' ? 'ios' : 'android',
    };

    api
      .put<User>('/me', {payload: updatedSettings})
      .catch(e => console.log('Failed to save mobile_os for the user: ', e));
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

        if (isAuthenticated) {
          await syncAllPlatformActivities();
        }

        BackgroundFetch.finish(taskId);
      },
      e => {
        console.log('[js] RNBackgroundFetch failed to start');
      },
    );
  };

  return null;
};
