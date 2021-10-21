import api from '@api';
import messaging from '@react-native-firebase/messaging';

/**
 * Request permission to receive push notifications on iOS
 * (On Android, this is not required and always resolves true)
 */
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();

  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Sends the device's current FCM token to the backend to be associated with the user
 */
export const saveCurrentToken = async () => {
  try {
    const hasPermission = await requestUserPermission();

    if (!hasPermission) return;

    const token = await messaging().getToken();

    await api.post(`/me/fcm-token`, {payload: {token}} as any);
  } catch (e: any) {
    console.log('Failed to save FCM token: ' + e.message);
  }
};

/**
 * Sends the device's current FCM token to the backend to be deleted
 */
export const deleteCurrentToken = async () => {
  try {
    const token = await messaging().getToken();

    await api.post(`/me/remove-fcm-token`, {payload: {token}} as any);
  } catch (e: any) {
    console.log('Failed to delete FCM token: ' + e.message);
  }
};
