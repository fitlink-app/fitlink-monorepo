import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppBackground, DeeplinkHandler, LifeCycleEvents} from '@components';
import {withQueryClient} from '@query';
import {ModalProvider, Transition} from './contexts';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';
import {Platform, UIManager} from 'react-native';
import {persistor, store} from 'redux/store';
import RNBootSplash from 'react-native-bootsplash';
import codePush from 'react-native-code-push';
import {useCodePush, useIntercomNotifications} from '@hooks';
import {UpdateInfo} from 'components/UpdateInfo';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

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
      webClientId:
        '369193601741-o9ao2iqikmcm0fte2t4on85hrni4dsjc.apps.googleusercontent.com',
    });

    setTimeout(() => {
      RNBootSplash.hide();
      syncImmediate();
    }, 1000);
  }, []);

  if (isUpToDate || isError) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <AppBackground>
            <Provider store={store}>
              <PersistGate persistor={persistor}>
                <LifeCycleEvents />
                <Transition>
                  <ModalProvider>
                    <QueryPersistor>
                      <DeeplinkHandler />
                      <Router />
                    </QueryPersistor>
                  </ModalProvider>
                </Transition>
              </PersistGate>
            </Provider>
          </AppBackground>
        </ThemeProvider>
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
