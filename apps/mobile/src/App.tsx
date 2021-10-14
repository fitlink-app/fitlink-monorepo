import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppBackground} from '@components';
import {withQueryClient} from '@query';
import {ModalProvider, Transition} from './contexts';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';
import {Platform, UIManager} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {persistor, store} from 'redux/store';
import RNBootSplash from 'react-native-bootsplash';
import codePush from 'react-native-code-push';
import {useCodePush} from '@hooks';
import {UpdateInfo} from 'components/UpdateInfo';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrbzBhOHVpeDA5Y2gyd253MncxOGxoZjgifQ.Vyr2eDUhaZgR1VFoLaatbA',
);

const App = () => {
  const {syncImmediate, isUpToDate, isError, syncMessage, progressFraction} =
    useCodePush();

  useEffect(() => {
    setTimeout(() => {
      RNBootSplash.hide();
      syncImmediate();
    }, 1000);
  }, []);

  if (isUpToDate || isError)
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <AppBackground>
            <Provider store={store}>
              <PersistGate persistor={persistor}>
                <Transition>
                  <ModalProvider>
                    <QueryPersistor>
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
