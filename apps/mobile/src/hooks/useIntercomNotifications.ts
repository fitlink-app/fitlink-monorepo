import Intercom from '@intercom/intercom-react-native';
import {useEffect} from 'react';
import {AppState} from 'react-native';

// Use once at app root level
export const useIntercomNotifications = () => {
  useEffect(() => {
    /**
     * Handle PushNotification
     */
    AppState.addEventListener(
      'change',
      nextAppState => nextAppState === 'active' && Intercom.handlePushMessage(),
    );

    return () => AppState.removeEventListener('change', () => true);
  }, []);
};
