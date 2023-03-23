import {Provider} from 'react-redux';
import React, {useEffect} from 'react';
import Config from 'react-native-config';
import {persistor, store} from 'redux/store';
import codePush from 'react-native-code-push';
import {Platform, UIManager} from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import {PersistGate} from 'redux-persist/integration/react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {withQueryClient} from '@query';
import {AppBackground, DeeplinkHandler, LifeCycleEvents} from '@components';
import {useCodePush, useIntercomNotifications} from '@hooks';
import Router, {NavigationProvider} from '@routes';

import {UpdateInfo} from 'components/UpdateInfo';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  SnackbarProvider,
  DefaultErrorSnackbarHandler,
} from 'components/snackbar';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';
import {ModalProvider, Transition} from './contexts';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const App = () => {
  const {syncImmediate, isUpToDate, isError, syncMessage, progressFraction} =
    useCodePush();

  useIntercomNotifications();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      iosClientId: Config.IOS_CLIENT_ID,
    });

    setTimeout(() => {
      RNBootSplash.hide();
      syncImmediate();
    }, 1000);
  }, []);

  if (isUpToDate || isError) {
    return (
      <SafeAreaProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <AppBackground>
              <Provider store={store}>
                <PersistGate persistor={persistor}>
                  <NavigationProvider>
                    <LifeCycleEvents />
                    <Transition>
                      <ModalProvider>
                        <QueryPersistor>
                          <DeeplinkHandler />
                          <DefaultErrorSnackbarHandler />
                          <Router />
                        </QueryPersistor>
                      </ModalProvider>
                    </Transition>
                  </NavigationProvider>
                </PersistGate>
              </Provider>
            </AppBackground>
          </ThemeProvider>
        </SnackbarProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UpdateInfo progress={progressFraction} message={syncMessage} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const appWithQuery = withQueryClient(App);

const codePushOptions = {checkFrequency: codePush.CheckFrequency.MANUAL};

export default codePush(codePushOptions)(appWithQuery);
