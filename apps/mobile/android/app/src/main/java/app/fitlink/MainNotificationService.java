package app.fitlink;

import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService;
import com.intercom.reactnative.IntercomModule;
import com.google.firebase.messaging.RemoteMessage;

public class MainNotificationService extends ReactNativeFirebaseMessagingService {

  @Override
  public void onNewToken(String token) {
    IntercomModule.sendTokenToIntercom(getApplication(), token);
    super.onNewToken(token);
  }

  public void onMessageReceived(RemoteMessage remoteMessage) {
    if (IntercomModule.isIntercomPush(remoteMessage)) {
      IntercomModule.handleRemotePushMessage(getApplication(), remoteMessage);
    } else {
      super.onMessageReceived(remoteMessage);
    }
  }
}
