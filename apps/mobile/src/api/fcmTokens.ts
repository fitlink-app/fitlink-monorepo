import {Platform} from 'react-native';
import ReactNativePermissions, {PERMISSIONS} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';

import api from '@api';

function shouldAskForAndroidPermission() {
  return Platform.OS === 'android' && Platform.Version >= 33;
}

async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();

    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } else if (shouldAskForAndroidPermission()) {
    const result = await ReactNativePermissions.request(
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    );
    return result === 'granted';
  }
  return true;
}

const saveCurrentToken = async () => {
  try {
    const hasPermission = await requestUserPermission();

    if (!hasPermission) {
      console.warn('saveCurrentToken: Permission denied');
      return;
    }

    const token = await messaging().getToken();

    await api.post('/me/fcm-token', {payload: {token}} as any);
  } catch (e) {
    console.error('saveCurrentToken', e);
  }
};

const deleteCurrentToken = async () => {
  try {
    const token = await messaging().getToken();

    await api.post('/me/remove-fcm-token', {payload: {token}} as any);
  } catch (e) {
    console.error('deleteCurrentToken', e);
  }
};

export const FCMTokenService = {
  saveCurrentToken,
  deleteCurrentToken,
};
